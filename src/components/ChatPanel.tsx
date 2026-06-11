import { useRef, useState, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, ChevronDown } from "lucide-react";
import { useSupabaseChat } from "../hooks/useSupabaseChat";
import type { ChatMessage } from "../lib/supabase";

interface ChatPanelProps {
  username: string;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function ChatBubble({ msg, isMe }: { msg: ChatMessage; isMe: boolean }) {
  return (
    <div className={`chat-bubble ${isMe ? "chat-bubble--me" : ""}`}>
      <div className="chat-bubble-header">
        <span className={`chat-username ${isMe ? "chat-username--me" : ""}`}>{msg.username}</span>
        <span className="chat-time">{formatDate(msg.created_at)}</span>
      </div>
      <p className="chat-text">{msg.message}</p>
    </div>
  );
}

export function ChatPanel({ username }: ChatPanelProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [unread, setUnread] = useState(0);
  const [atBottom, setAtBottom] = useState(true);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevCountRef = useRef(0);

  const { messages, isLoading, sendMessage } = useSupabaseChat(username);

  // Auto-scroll and unread badge
  useEffect(() => {
    const newCount = messages.length;
    if (newCount > prevCountRef.current) {
      if (open && atBottom) {
        requestAnimationFrame(() => {
          listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
        });
      } else if (!open) {
        setUnread((u) => u + (newCount - prevCountRef.current));
      }
    }
    prevCountRef.current = newCount;
  }, [messages, open, atBottom]);

  useEffect(() => {
    if (open) {
      setUnread(0);
      requestAnimationFrame(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
      });
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const handleScroll = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 40);
  }, []);

  const scrollToBottom = () => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    setAtBottom(true);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    await sendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating toggle button — bottom-left */}
      <button
        className="chat-toggle-btn"
        onClick={() => setOpen((o) => !o)}
        title="Chat"
        aria-label="Open chat"
      >
        {open ? <X size={20} /> : <MessageCircle size={20} />}
        {!open && unread > 0 && (
          <span className="chat-unread-badge">{unread > 99 ? "99+" : unread}</span>
        )}
      </button>

      {/* Chat panel */}
      <div className={`chat-panel ${open ? "chat-panel--open" : ""}`}>
        {/* Header */}
        <div className="chat-header">
          <div className="chat-header-left">
            <MessageCircle size={15} />
            <span className="chat-header-title">Chat</span>
            <span className="chat-header-user">· {username}</span>
          </div>
          <button className="chat-close-btn" onClick={() => setOpen(false)}>
            <X size={15} />
          </button>
        </div>

        {/* Message list */}
        <div
          className="chat-messages"
          ref={listRef}
          onScroll={handleScroll}
        >
          {isLoading && (
            <div className="chat-loading">
              <div className="chat-spinner" />
              <span>Yükleniyor…</span>
            </div>
          )}
          {!isLoading && messages.length === 0 && (
            <div className="chat-empty">
              <MessageCircle size={28} style={{ opacity: 0.3 }} />
              <p>Henüz mesaj yok. İlk sen yaz!</p>
            </div>
          )}
          {messages.map((msg) => (
            <ChatBubble key={msg.id} msg={msg} isMe={msg.username === username} />
          ))}
        </div>

        {/* Scroll-to-bottom btn */}
        {!atBottom && (
          <button className="chat-scroll-btn" onClick={scrollToBottom}>
            <ChevronDown size={14} />
          </button>
        )}

        {/* Input */}
        <div className="chat-input-row">
          <input
            ref={inputRef}
            className="chat-input"
            placeholder="Mesaj yaz… (Enter)"
            value={input}
            maxLength={300}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className="chat-send-btn"
            onClick={handleSend}
            disabled={!input.trim()}
            aria-label="Send"
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </>
  );
}
