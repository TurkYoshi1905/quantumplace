# QuantumPlace

> Kuantum temalı piksel sanat tuvali — r/place ruhunda, modern web teknolojileriyle inşa edildi.

---

## Proje Özeti

QuantumPlace, kullanıcıların 1000×1000 piksel bir tuval üzerinde sanat eserleri oluşturduğu bir piksel boyama deneyimidir. Her kullanıcı bir seferde bir piksel boyar ve bekleme süresi geçtikten sonra bir sonraki pikseli yerleştirebilir. Piksel verisi tarayıcıda kalıcı olarak saklanır.

---

## Öne Çıkan Özellikler

| Özellik | Açıklama |
|---|---|
| **1000×1000 Tuval** | HTML5 Canvas üzerinde piksel hassasiyetinde render |
| **r/place Arayüzü** | Üst ortada koordinat+zoom hücresi, alt ortada kalıcı "Bir piksel yerleştir" butonu |
| **5x Maksimum Zoom** | Pikselleri kristal netliğinde büyütür; fit-to-screen ile açılır |
| **Crosshair / Nişangah** | Fare imlecini takip eden köşe braket — tam hangi pikselde olduğunuzu gösterir |
| **IndexedDB Kalıcılığı** | Tüm piksel verisi tarayıcıda saklanır; sayfa yenilendiğinde tuval kayıpsız geri yüklenir |
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
| **Depolama** | IndexedDB (~4MB, tarayıcı içi kalıcı) |
| **Build** | Vite 7 |
| **Paket Yöneticisi** | pnpm (monorepo workspace) |
| **İkonlar** | lucide-react |
| **Fontlar** | Google Fonts — Inter, JetBrains Mono |
| **Deployment** | Vercel (SPA routing, asset cache, güvenlik başlıkları) |
| **Senkronizasyon** | `github-sync.sh` (GITHUB_PAT ile otomatik push/pull) |

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

# 3. Geliştirme sunucusunu başlatın
npm run dev
```

Tarayıcınızda `http://localhost:5173` adresini açın.

---

## Vercel Deployment

1. GitHub deposunu Vercel'e bağlayın.
2. Herhangi bir ayar yapmanıza gerek yok — `vercel.json` her şeyi otomatik yapılandırır:
   - SPA routing (`/*` → `/index.html`)
   - Asset cache (1 yıl, immutable)
   - Güvenlik başlıkları (X-Frame-Options, X-Content-Type-Options vb.)

---

## GitHub Senkronizasyonu (Replit)

```bash
# GitHub'a push
bash artifacts/quantum-place/github-sync.sh push "feat: yeni özellik"

# GitHub'dan çek
bash artifacts/quantum-place/github-sync.sh pull
```

Script otomatik olarak:
- `catalog:` bağımlılıkları gerçek sürümlere çözer (npm uyumluluğu)
- Vercel-uyumlu `vite.config.ts` ve `tsconfig.json` oluşturur
- Replit-özel paketleri kaldırır
- `replit.md` dahil tüm proje belgelerini gönderir

> **Not:** `GITHUB_PAT` Replit Secret olarak tanımlı olmalıdır.

---

## Oyun Nasıl Oynanır?

1. **Kaydırma:** Sol tık + sürükle veya tek parmak ile tuvelde gezin.
2. **Zoom:** Fare tekerleği veya çift parmak sıkıştırma ile yakınlaştırın/uzaklaştırın.
3. **Piksel Seçimi:** Tuvelde istediğiniz piksele tıklayın.
4. **Renk Seçimi:** Alt panelden 32 renkli paletten veya özel renk seçiciden seçin.
5. **Yerleştir:** "Bir piksel yerleştir" butonuna tıklayın.
6. **Bekleme:** 1 saniyelik kuantum bekleme sonrasında tekrar boyayabilirsiniz.
7. **Bilgi:** Sağ üst ? butonuna tıklayarak oyun hakkında bilgi alabilirsiniz.

---

## Proje Yapısı

```
artifacts/quantum-place/
├── src/
│   ├── components/
│   │   ├── HUD.tsx           # Koordinat + zoom HUD overlay
│   │   ├── BottomPanel.tsx   # Renk paleti + CTA butonu
│   │   ├── ColorPicker.tsx   # 32 renkli palet
│   │   ├── CooldownTimer.tsx # Animasyonlu bekleme sayacı
│   │   ├── InfoModal.tsx     # ? butonu premium bilgi modal
│   │   └── QuantumCanvas.tsx # Canvas wrapper
│   ├── hooks/
│   │   ├── useCanvas.ts      # Tüm canvas mantığı (1000×1000, zoom, grid)
│   │   ├── useIndexedDB.ts   # Kalıcı depolama (~4MB)
│   │   └── useCooldown.ts    # Bekleme mekanizması
│   ├── i18n/
│   │   ├── translations.ts   # TR/EN çeviriler
│   │   └── context.tsx       # I18n sağlayıcı
│   ├── pages/
│   │   ├── Game.tsx          # Ana oyun sayfası
│   │   └── SettingsPage.tsx  # Ayarlar sayfası
│   ├── types/index.ts        # TypeScript tip tanımları
│   └── index.css             # Global stiller ve CSS değişkenleri
├── github-sync.sh            # GitHub senkronizasyon betiği
├── vercel.json               # Vercel SPA routing + headers
├── replit.md                 # Replit geliştirici dokümantasyonu
└── package.json
```

---

## Lisans

MIT — Özgürce kullanabilir, değiştirebilir ve dağıtabilirsiniz.

---

<p align="center">
  <strong>Q</strong>uantumPlace — Her piksel bir katkıdır.
</p>
