import { useEffect, useRef, useCallback } from "react";
import { supabase, supabaseReady, type PixelRecord } from "../lib/supabase";
import type { PixelCoord } from "../types";

interface PixelMeta {
  username: string;
  placed_at: string;
  color: string;
}

interface UseSupabasePixelsOptions {
  username: string;
  onRemotePixel: (x: number, y: number, color: string) => void;
  onMetaUpdate: (x: number, y: number, meta: PixelMeta) => void;
}

export function useSupabasePixels({
  username,
  onRemotePixel,
  onMetaUpdate,
}: UseSupabasePixelsOptions) {
  // ── Callback refs: subscription açıldıktan sonra deps değişse de
  // kanal yeniden oluşturulmaz; her mouse move'da subscription restart olmaz.
  const onRemotePixelRef = useRef(onRemotePixel);
  const onMetaUpdateRef  = useRef(onMetaUpdate);
  useEffect(() => { onRemotePixelRef.current = onRemotePixel; }, [onRemotePixel]);
  useEffect(() => { onMetaUpdateRef.current  = onMetaUpdate;  }, [onMetaUpdate]);

  // Load initial canvas from Supabase — called once after canvas is ready
  const loadInitialPixels = useCallback(
    async (paintFn: (x: number, y: number, color: string) => void) => {
      if (!supabaseReady) return;

      const { data, error } = await supabase
        .from("pixels")
        .select("x, y, color, username, placed_at");

      if (error) {
        console.error("Failed to load pixels:", error.message);
        return;
      }

      if (data) {
        for (const row of data as PixelRecord[]) {
          paintFn(row.x, row.y, row.color);
          onMetaUpdateRef.current(row.x, row.y, {
            username: row.username,
            placed_at: row.placed_at,
            color: row.color,
          });
        }
      }
    },
    [] // Stable — refs used inside, no external deps needed
  );

  // Realtime subscription — empty deps → channel created exactly ONCE
  useEffect(() => {
    if (!supabaseReady) return;

    const channel = supabase
      .channel("pixels-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pixels" },
        (payload) => {
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            const row = payload.new as PixelRecord;
            onRemotePixelRef.current(row.x, row.y, row.color);
            onMetaUpdateRef.current(row.x, row.y, {
              username: row.username,
              placed_at: row.placed_at,
              color: row.color,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []); // ← boş deps: subscription bir kez açılır, asla yeniden oluşturulmaz

  // Place a pixel → upsert to Supabase
  const placePixel = useCallback(
    async (coord: PixelCoord, color: string) => {
      if (!supabaseReady) return;

      const placed_at = new Date().toISOString();
      const { error } = await supabase.from("pixels").upsert(
        { x: coord.x, y: coord.y, color, username, placed_at },
        { onConflict: "x,y" }
      );

      if (error) {
        console.error("Failed to place pixel:", error.message);
      }
    },
    [username]
  );

  return { placePixel, loadInitialPixels };
}
