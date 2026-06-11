-- ============================================================
--  QuantumPlace — Supabase SQL Schema
--  Supabase Dashboard > SQL Editor'a yapıştır ve çalıştır.
-- ============================================================

-- ─── UZANTILAR ───────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── PIXELS TABLOSU ──────────────────────────────────────────
-- Her piksel (x,y) koordinatı için yalnızca en son yerleştirme saklanır.
-- Upsert (onConflict: "x,y") ile her koordinat güncellenir.

create table if not exists public.pixels (
  id          bigint generated always as identity primary key,
  x           integer not null check (x >= 0 and x < 1000),
  y           integer not null check (y >= 0 and y < 1000),
  color       varchar(7) not null default '#ffffff'
              check (color ~ '^#[0-9a-fA-F]{6}$'),
  username    varchar(20) not null,
  placed_at   timestamptz not null default now(),
  created_at  timestamptz not null default now()
);

-- Koordinat üzerinde unique constraint (upsert için)
alter table public.pixels
  drop constraint if exists pixels_xy_unique;
alter table public.pixels
  add constraint pixels_xy_unique unique (x, y);

-- Performans indeksleri
create index if not exists pixels_xy_idx      on public.pixels (x, y);
create index if not exists pixels_username_idx on public.pixels (username);
create index if not exists pixels_placed_at_idx on public.pixels (placed_at desc);

-- ─── CHAT_MESSAGES TABLOSU ───────────────────────────────────
create table if not exists public.chat_messages (
  id          bigint generated always as identity primary key,
  username    varchar(20) not null,
  message     text not null check (char_length(message) <= 300),
  created_at  timestamptz not null default now()
);

create index if not exists chat_messages_created_idx on public.chat_messages (created_at desc);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────
alter table public.pixels        enable row level security;
alter table public.chat_messages enable row level security;

-- Pixels: herkes okuyabilir
create policy "pixels_select_public"
  on public.pixels for select
  using (true);

-- Pixels: herkes insert/update yapabilir (anon key ile)
create policy "pixels_insert_public"
  on public.pixels for insert
  with check (true);

create policy "pixels_update_public"
  on public.pixels for update
  using (true)
  with check (true);

-- Chat: herkes okuyabilir
create policy "chat_select_public"
  on public.chat_messages for select
  using (true);

-- Chat: herkes mesaj gönderebilir
create policy "chat_insert_public"
  on public.chat_messages for insert
  with check (true);

-- ─── REALTIME YAYINLARI ──────────────────────────────────────
-- Supabase Dashboard > Realtime > Tables bölümünden
-- pixels ve chat_messages tablolarını aktif edin.
-- Ya da aşağıdaki komutları çalıştırın:

-- pixels tablosunu realtime'a ekle
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;

alter publication supabase_realtime add table public.pixels;
alter publication supabase_realtime add table public.chat_messages;

-- ─── YARDIMCI VIEW'LAR ───────────────────────────────────────

-- Kullanıcı istatistikleri
create or replace view public.user_stats as
  select
    username,
    count(*) as pixel_count,
    max(placed_at) as last_active
  from public.pixels
  group by username
  order by pixel_count desc;

-- Son 100 piksel aktivitesi
create or replace view public.recent_pixels as
  select
    x, y, color, username, placed_at
  from public.pixels
  order by placed_at desc
  limit 100;

-- ─── TEMIZLIK FONKSİYONU (opsiyonel) ─────────────────────────
-- Eski chat mesajlarını temizlemek için (7 günden eski):
create or replace function public.cleanup_old_messages()
returns void
language plpgsql
as $$
begin
  delete from public.chat_messages
  where created_at < now() - interval '7 days';
end;
$$;

-- ─── KULLANIM NOTLARI ─────────────────────────────────────────
-- 1. Supabase Dashboard > Authentication > Settings >
--    "Enable email confirmations" KAPALI olmalı (anon key kullanılıyor)
-- 2. Dashboard > API > "anon" key'i VITE_SUPABASE_ANON_KEY olarak Replit Secrets'e ekle
-- 3. Dashboard > Realtime > pixels ve chat_messages tablolarını aktif et
-- 4. Bu SQL'i Dashboard > SQL Editor'dan çalıştır
-- ─────────────────────────────────────────────────────────────
