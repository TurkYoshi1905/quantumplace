# QuantumPlace

> Kuantum temalı gerçek zamanlı piksel sanat tuvali — r/place ruhunda, Supabase WebSocket ile çok oyunculu, modern web teknolojileriyle inşa edildi.

---

## Proje Özeti

QuantumPlace, kullanıcıların 1000×1000 piksel bir tuval üzerinde gerçek zamanlı olarak birlikte sanat eserleri oluşturduğu çok oyunculu bir piksel boyama deneyimidir. Her kullanıcı önce kullanıcı adını girer, ardından tuval üzerinde piksel seçer, renk belirler ve yerleştirir. Piksel değişiklikleri Supabase WebSocket kanalı aracılığıyla tüm bağlı kullanıcılara anında iletilir. Sohbet paneli ile oyuncular birbirleriyle gerçek zamanlı iletişim kurabilir. Piksel verisi hem tarayıcıda (IndexedDB) hem de bulutta (Supabase PostgreSQL) kalıcı olarak saklanır.

---

## Öne Çıkan Özellikler

| Özellik | Açıklama |
|---|---|
| **Çok Oyunculu Gerçek Zamanlı** | Supabase WebSocket ile piksel değişiklikleri tüm oyunculara anında yansır |
| **Hoşgeldin Onboarding** | Kullanıcı adı girişi, TR/EN otomatik dil algılama, glassmorphism tasarım |
| **Gerçek Zamanlı Sohbet** | Sol alt köşe sohbet paneli, okunmamış mesaj sayacı, balloon UI |
| **Piksel Hover Tooltip** | Üzerine gelince: kimin koyduğu, ne zaman (DD.MM.YYYY HH:MM), koordinat |
| **1000×1000 Tuval** | HTML5 Canvas üzerinde piksel hassasiyetinde render |
| **r/place Arayüzü** | Üst ortada koordinat+zoom hücresi, alt ortada kalıcı "Bir piksel yerleştir" butonu |
| **40x Maksimum Zoom** | Pikselleri kristal netliğinde büyütür; fit-to-screen ile açılır |
| **Crosshair / Nişangah** | Fare imlecini takip eden köşe braket — tam hangi pikselde olduğunuzu gösterir |
| **IndexedDB Kalıcılığı** | Tüm piksel verisi tarayıcıda saklanır; sayfa yenilendiğinde tuval kayıpsız geri yüklenir |
| **Supabase Senkronizasyonu** | Piksel ve sohbet verisi PostgreSQL'de; Realtime subscription ile anlık dağıtım |
| **1s Kuantum Bekleme** | Animasyonlu SVG halka ile geri sayım |
| **32 Renkli Palet** | Özel renk seçici ile sınırsız renk imkânı |
| **Info Modal** | ? butonu → premium glassmorphism oyun bilgi ekranı |
| **TR / EN Dil Desteği** | Tam Türkçe ve İngilizce arayüz; tarayıcı dili otomatik algılanır |
| **Vercel Deployment** | `vercel.json` SPA routing + `github-sync.sh` otomatik Vercel-uyumlu build |
| **Mobil Uyumlu** | Çift parmak zoom, dokunmatik kaydırma, responsive layout |

---

## Kullanılan Teknolojiler

| Katman | Teknoloji |
|---|---|
| **Framework** | React 19.2 |
| **Dil** | TypeScript 5.9 — strict mod, `any` yok |
| **Stil** | Tailwind CSS + CSS özel değişkenleri (`--q*` token sistemi) |
| **Canvas** | HTML5 Canvas API — offscreen canvas + RAF render döngüsü |
| **Gerçek Zamanlı** | Supabase Realtime (WebSocket, postgres_changes) |
| **Veritabanı** | Supabase PostgreSQL (pixels + chat_messages tabloları) |
| **Depolama** | IndexedDB (~4MB, tarayıcı içi kalıcı) + Supabase (bulut kalıcı) |
| **Build** | Vite 7 |
| **Paket Yöneticisi** | pnpm (monorepo workspace) |
| **İkonlar** | lucide-react |
| **Fontlar** | Google Fonts — Inter, JetBrains Mono |
| **Deployment** | Vercel (SPA routing, asset cache, güvenlik başlıkları) |
| **Senkronizasyon** | `github-sync.sh` (GITHUB_PAT ile otomatik push/pull) |

---

## Supabase Kurulumu

### 1. SQL Şemasını Çalıştırın

Supabase Dashboard > **SQL Editor** bölümünde `supabase_schema.sql` dosyasını kopyalayıp çalıştırın.

Bu işlem aşağıdakileri otomatik olarak oluşturur:
- `pixels` tablosu (x, y, color, username, placed_at — benzersiz koordinat kısıtlaması)
- `chat_messages` tablosu (username, message, created_at)
- Row Level Security politikaları (herkes okuyabilir ve yazabilir)
- Realtime publication (`pixels` ve `chat_messages` tabloları için)
- Performans indeksleri

### 2. Realtime'ı Aktif Edin

Supabase Dashboard > **Realtime** > Tables bölümünden `pixels` ve `chat_messages` tablolarını aktif edin.

### 3. Ortam Değişkenlerini Ayarlayın

| Değişken | Nereden Alınır |
|---|---|
| `VITE_SUPABASE_URL` | Dashboard > Settings > API > Project URL |
| `VITE_SUPABASE_ANON_KEY` | Dashboard > Settings > API > anon/public key |

> **Vercel için:** Project Settings > Environment Variables bölümüne ekleyin.

---

## Kurulum ve Yerel Çalıştırma

### Gereksinimler
- Node.js 20+
- npm veya pnpm

### Adımlar

```bash
# 1. Depoyu klonlayın
git clone https://github.com/TurkYoshi1905/quantumplace.git
cd quantumplace

# 2. Bağımlılıkları yükleyin
npm install

# 3. Ortam değişkenlerini ayarlayın
cp .env.example .env
# .env dosyasını Supabase bilgilerinizle doldurun:
# VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
# VITE_SUPABASE_ANON_KEY=eyJ...

# 4. Geliştirme sunucusunu başlatın
npm run dev
```

Tarayıcınızda `http://localhost:5173` adresini açın.

---

## Vercel Deployment

1. GitHub deposunu Vercel'e bağlayın.
2. **Environment Variables** bölümüne ekleyin:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. `vercel.json` her şeyi otomatik yapılandırır:
   - SPA routing (`/*` → `/index.html`)
   - Asset cache (1 yıl, immutable)
   - Güvenlik başlıkları (X-Frame-Options, X-Content-Type-Options vb.)

---

## GitHub Senkronizasyonu (Replit)

```bash
# GitHub'a push
QUANTUM_DIR=/home/runner/workspace/artifacts/quantumplace \
  bash .migration-backup/github-sync.sh push "feat: yeni özellik"

# GitHub'dan çek
QUANTUM_DIR=/home/runner/workspace/artifacts/quantumplace \
  bash .migration-backup/github-sync.sh pull
```

Script otomatik olarak:
- `catalog:` bağımlılıkları gerçek sürümlere çözer (npm uyumluluğu)
- Vercel-uyumlu `vite.config.ts` ve `tsconfig.json` oluşturur
- Replit-özel paketleri kaldırır
- `replit.md` dahil tüm proje belgelerini gönderir

> **Not:** `GITHUB_PAT` Replit Secret olarak tanımlı olmalıdır.

---

## Oyun Nasıl Oynanır?

1. **Kullanıcı Adı:** İlk açılışta hoşgeldin ekranında kullanıcı adınızı girin (2–20 karakter).
2. **Kaydırma:** Sol tık + sürükle veya tek parmak ile tuvelde gezin.
3. **Zoom:** Fare tekerleği veya çift parmak sıkıştırma ile yakınlaştırın/uzaklaştırın.
4. **Piksel Seçimi:** Tuvelde istediğiniz piksele tıklayın.
5. **Renk Seçimi:** Alt panelden 32 renkli paletten veya özel renk seçiciden seçin.
6. **Yerleştir:** "Bir piksel yerleştir" butonuna tıklayın — değişiklik anında diğer oyunculara yansır.
7. **Bekleme:** 1 saniyelik kuantum bekleme sonrasında tekrar boyayabilirsiniz.
8. **Sohbet:** Sol alt köşedeki MessageCircle ikonuna tıklayarak sohbet panelini açın.
9. **Tooltip:** Başka oyuncuların piksellerinin üzerine gelerek kim ve ne zaman koyduğunu görün.
10. **Bilgi:** Sağ üst ? butonuna tıklayarak oyun hakkında bilgi alabilirsiniz.

---

## Proje Yapısı

```
quantumplace/
├── src/
│   ├── components/
│   │   ├── HUD.tsx                # Koordinat + zoom HUD overlay
│   │   ├── BottomPanel.tsx        # Renk paleti + CTA butonu
│   │   ├── ColorPicker.tsx        # 32 renkli palet
│   │   ├── CooldownTimer.tsx      # Animasyonlu bekleme sayacı
│   │   ├── InfoModal.tsx          # ? butonu premium bilgi modal
│   │   ├── QuantumCanvas.tsx      # Canvas wrapper
│   │   ├── ChatPanel.tsx          # Gerçek zamanlı sohbet paneli (sol alt)
│   │   └── PixelTooltip.tsx       # Hover tooltip (kim/ne zaman)
│   ├── hooks/
│   │   ├── useCanvas.ts           # Tüm canvas mantığı (1000×1000, zoom, grid)
│   │   ├── useIndexedDB.ts        # Kalıcı depolama (~4MB)
│   │   ├── useCooldown.ts         # Bekleme mekanizması
│   │   ├── useSupabasePixels.ts   # Realtime piksel senkronizasyonu
│   │   └── useSupabaseChat.ts     # Realtime sohbet + mesaj geçmişi
│   ├── lib/
│   │   └── supabase.ts            # Supabase istemcisi + tip tanımları
│   ├── i18n/
│   │   ├── translations.ts        # TR/EN çeviriler
│   │   └── context.tsx            # I18n sağlayıcı
│   ├── pages/
│   │   ├── WelcomePage.tsx        # Kullanıcı adı onboarding sayfası
│   │   ├── Game.tsx               # Ana oyun sayfası
│   │   └── SettingsPage.tsx       # Ayarlar sayfası
│   ├── types/index.ts             # TypeScript tip tanımları
│   └── index.css                  # Global stiller ve CSS değişkenleri
├── supabase_schema.sql            # Supabase SQL şeması (tablolar, RLS, realtime)
├── github-sync.sh                 # GitHub senkronizasyon betiği
├── vercel.json                    # Vercel SPA routing + headers
├── replit.md                      # Replit geliştirici dokümantasyonu
└── package.json
```

---

## Supabase Şema Özeti

### `pixels` Tablosu
```sql
pixels (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  x           INTEGER NOT NULL CHECK (0 <= x < 1000),
  y           INTEGER NOT NULL CHECK (0 <= y < 1000),
  color       VARCHAR(7) NOT NULL,          -- #rrggbb
  username    VARCHAR(20) NOT NULL,
  placed_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (x, y)                            -- upsert koordinat kilidi
)
```

### `chat_messages` Tablosu
```sql
chat_messages (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  username    VARCHAR(20) NOT NULL,
  message     TEXT NOT NULL CHECK (char_length(message) <= 300),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
)
```

Her iki tabloda da **Row Level Security** aktiftir; anonim anahtar ile okuma ve yazma izni verilmiştir.

---

## Lisans

MIT — Özgürce kullanabilir, değiştirebilir ve dağıtabilirsiniz.

---

<p align="center">
  <strong>Q</strong>uantumPlace — Her piksel bir katkıdır. Birlikte boyayalım.
</p>
