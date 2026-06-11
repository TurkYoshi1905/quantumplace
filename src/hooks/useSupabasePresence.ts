import { useEffect, useRef, useState } from "react";
import { supabase, supabaseReady } from "../lib/supabase";

export function useSupabasePresence(username: string) {
  const [onlineCount, setOnlineCount] = useState(0);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!supabaseReady || !username) return;

    const channel = supabase.channel("online-users", {
      config: {
        presence: { key: username },
      },
    });

    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState();
      setOnlineCount(Object.keys(state).length);
    });

    channel.on("presence", { event: "join" }, ({ newPresences }) => {
      void newPresences; // handled by sync
    });

    channel.on("presence", { event: "leave" }, () => {
      const state = channel.presenceState();
      setOnlineCount(Object.keys(state).length);
    });

    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({
          username,
          online_at: new Date().toISOString(),
        });
      }
    });

    channelRef.current = channel;

    return () => {
      channel.untrack();
      supabase.removeChannel(channel);
    };
  }, [username]);

  return { onlineCount };
}
