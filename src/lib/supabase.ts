import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabaseReady = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient = supabaseReady
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      realtime: { params: { eventsPerSecond: 10 } },
    })
  : (null as unknown as SupabaseClient);

export type PixelRecord = {
  id: number;
  x: number;
  y: number;
  color: string;
  username: string;
  placed_at: string;
};

export type ChatMessage = {
  id: number;
  username: string;
  message: string;
  created_at: string;
};
