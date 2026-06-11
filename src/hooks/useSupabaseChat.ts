import { useEffect, useRef, useState, useCallback } from "react";
import { supabase, type ChatMessage } from "../lib/supabase";

export function useSupabaseChat(username: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Load last 50 messages
  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("id, username, message, created_at")
        .order("created_at", { ascending: false })
        .limit(50);

      if (!error && data) {
        setMessages((data as ChatMessage[]).reverse());
      }
      setIsLoading(false);
    };
    load();
  }, []);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("chat-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        (payload) => {
          const msg = payload.new as ChatMessage;
          setMessages((prev) => {
            if (prev.find((m) => m.id === msg.id)) return prev;
            return [...prev.slice(-99), msg];
          });
        }
      )
      .subscribe();

    channelRef.current = channel;
    return () => { supabase.removeChannel(channel); };
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || !username) return;

      const { error } = await supabase.from("chat_messages").insert({
        username,
        message: trimmed,
      });

      if (error) console.error("Chat send error:", error.message);
    },
    [username]
  );

  return { messages, isLoading, sendMessage };
}
