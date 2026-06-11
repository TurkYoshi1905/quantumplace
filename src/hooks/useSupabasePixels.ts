import { useEffect, useRef, useCallback } from "react";
import { supabase, type PixelRecord } from "../lib/supabase";
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
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Load initial canvas from Supabase
  const loadInitialPixels = useCallback(
    async (paintFn: (x: number, y: number, color: string) => void) => {
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
          onMetaUpdate(row.x, row.y, {
            username: row.username,
            placed_at: row.placed_at,
            color: row.color,
          });
        }
      }
    },
    [onMetaUpdate]
  );

  // Subscribe to realtime pixel changes
  useEffect(() => {
    const channel = supabase
      .channel("pixels-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pixels" },
        (payload) => {
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            const row = payload.new as PixelRecord;
            onRemotePixel(row.x, row.y, row.color);
            onMetaUpdate(row.x, row.y, {
              username: row.username,
              placed_at: row.placed_at,
              color: row.color,
            });
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onRemotePixel, onMetaUpdate]);

  // Place a pixel → upsert to Supabase
  const placePixel = useCallback(
    async (coord: PixelCoord, color: string) => {
      const placed_at = new Date().toISOString();
      const { error } = await supabase.from("pixels").upsert(
        {
          x: coord.x,
          y: coord.y,
          color,
          username,
          placed_at,
        },
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
