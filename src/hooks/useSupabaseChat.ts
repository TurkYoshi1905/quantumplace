import { useEffect, useRef, useState, useCallback } from "react";
import { supabase, supabaseReady, type ChatMessage } from "../lib/supabase";

export function useSupabaseChat(username: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(supabaseReady);

  // Load last 50 messages once
  useEffect(() => {
    if (!supabaseReady) { setIsLoading(false); return; }

    supabase
      .from("chat_messages")
      .select("id, username, message, created_at")
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data, error }) => {
        if (!error && data) setMessages((data as ChatMessage[]).reverse());
        setIsLoading(false);
      });
  }, []);

  // Realtime subscription — empty deps → opened exactly ONCE, no restarts
  useEffect(() => {
    if (!supabaseReady) return;

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

    return () => {
      supabase.removeChannel(channel);
    };
  }, []); // ← boş deps: bir kez açılır

  const sendMessage = useCallback(
    async (text: string) => {
      if (!supabaseReady || !text.trim() || !username) return;
      const { error } = await supabase
        .from("chat_messages")
        .insert({ username, message: text.trim() });
      if (error) console.error("Chat send error:", error.message);
    },
    [username]
  );

  return { messages, isLoading, sendMessage };
}
