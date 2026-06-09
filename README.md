# QuantumPlace

> Kuantum temalı, işbirlikçi piksel sanat tuvali — r/place ruhunda, modern web teknolojileriyle inşa edildi.

---

## Proje Özeti

QuantumPlace, kullanıcıların 2048×2048 piksel bir tuval üzerinde birlikte sanat eserleri oluşturduğu gerçek zamanlı bir piksel boyama deneyimidir. Her kullanıcı bir seferde bir piksel boyar ve bekleme süresi geçtikten sonra bir sonraki pikseli yerleştirebilir. Piksel verisi tarayıcıda kalıcı olarak saklanır.

---

## Öne Çıkan Premium Özellikler

| Özellik | Açıklama |
|---|---|
| **2048×2048 Tuval** | Tam boyutlu HTML5 Canvas üzerinde piksel hassasiyeti |
| **r/place Arayüzü** | Üst ortada koordinat+zoom hücresi, alt ortada kalıcı "Bir piksel yerleştir" butonu |
| **5x Maksimum Zoom** | Pikselleri kristal netliğinde büyütür; minimum zoom ile tüm tuval ekranda görünür |
| **Crosshair / Nişangah** | Fare imlecini takip eden köşe braket — tam hangi pikselde olduğunuzu gösterir |
| **IndexedDB Kalıcılığı** | Tüm piksel verisi tarayıcıda saklanır; sayfa yenilendiğinde tuval kayıpsız geri yüklenir |
| **1s Kuantum Bekleme** | Animasyonlu SVG halka ile geri sayım; botlamayı önler |
| **32 Renkli Palet** | Özel renk seçici ile sınırsız renk imkânı |
| **TR / EN Dil Desteği** | Tam Türkçe ve İngilizce arayüz; tarayıcı dili otomatik algılanır |
| **Davet Bağlantısı** | Koordinat URL parametresi ile (?x=&y=) belirli bir piksele doğrudan atlama |
| **Mobil Uyumlu** | Çift parmak zoom, dokunmatik kaydırma, responsive layout |

---

## Kullanılan Teknolojiler

| Katman | Teknoloji |
|---|---|
| **Framework** | React 19.2 (yeni JSX transform, concurrent features) |
| **Dil** | TypeScript 5.9 — strict mod, `any` yok |
| **Stil** | Tailwind CSS + CSS özel değişkenleri (`--q*` token sistemi) |
| **Canvas** | HTML5 Canvas API — offscreen canvas + RAF render döngüsü |
| **Depolama** | IndexedDB (tarayıcı içi kalıcı veri) |
| **Build** | Vite 7 |
| **Paket Yöneticisi** | pnpm (monorepo workspace) |
| **İkonlar** | lucide-react |
| **Fontlar** | Google Fonts — Inter, JetBrains Mono |
| **Senkronizasyon** | github-sync.sh (GITHUB_PAT ile otomatik push/pull) |

---

## Kurulum ve Yerel Çalıştırma

### Gereksinimler

- Node.js 20+
- pnpm 9+

### Adımlar

```bash
# 1. Depoyu klonlayın
git clone https://github.com/TurkYoshi1905/quantumplace.git
cd quantumplace

# 2. Bağımlılıkları yükleyin
pnpm install

# 3. Geliştirme sunucusunu başlatın
pnpm --filter @workspace/quantum-place run dev
```

Tarayıcınızda `http://localhost:22530` adresini açın.

---

## GitHub Senkronizasyonu

```bash
# GitHub'a push
bash artifacts/quantum-place/github-sync.sh push "feat: yeni özellik"

# GitHub'dan çek
bash artifacts/quantum-place/github-sync.sh pull
```

> **Not:** `GITHUB_PAT` ortam değişkeninin tanımlı olması gerekir. `git push --force` kullanılmaz.

---

## Oyun Nasıl Oynanır?

1. **Kaydırma:** Sol tık + sürükle veya tek parmak ile tuvelde gezin.
2. **Zoom:** Fare tekerleği veya çift parmak sıkıştırma ile yakınlaştırın/uzaklaştırın.
3. **Piksel Seçimi:** Tuvalde istediğiniz piksele tıklayın.
4. **Renk Seçimi:** Alt panelden 32 renkli paletten veya özel renk seçiciden seçin.
5. **Yerleştir:** "Bir piksel yerleştir" butonuna tıklayın.
6. **Bekleme:** 1 saniyelik kuantum bekleme sonrasında tekrar boyayabilirsiniz.

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
│   │   └── QuantumCanvas.tsx # Canvas wrapper
│   ├── hooks/
│   │   ├── useCanvas.ts      # Tüm canvas mantığı
│   │   ├── useIndexedDB.ts   # Kalıcı depolama
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
└── package.json
```

---

## Lisans

MIT — Özgürce kullanabilir, değiştirebilir ve dağıtabilirsiniz.

---

<p align="center">
  <strong>Q</strong>uantumPlace — Her piksel bir katkıdır.
</p>
