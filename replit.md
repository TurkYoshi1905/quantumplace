# QuantumPlace

Kuantum temalı gerçek zamanlı piksel boyama oyunu. r/place'ten ilham alınarak React 19.2, TypeScript ve Tailwind CSS ile sıfırdan geliştirilmiştir. Supabase entegrasyonu ile çok oyunculu, WebSocket tabanlı anlık senkronizasyon desteklenmektedir.

## Çalıştırma & Yönetim

```bash
pnpm --filter @workspace/quantumplace run dev       # Oyunu geliştirme modunda başlat (port 24720)
pnpm --filter @workspace/quantumplace run typecheck  # TypeScript tip kontrolü
pnpm --filter @workspace/quantumplace run build      # Üretim derlemesi
```

## GitHub Senkronizasyonu

Proje, `.migration-backup/github-sync.sh` betiği ile GitHub'a aktarılabilir.

```bash
# GitHub'a push (özel commit mesajı ile):
QUANTUM_DIR=/home/runner/workspace/artifacts/quantumplace bash .migration-backup/github-sync.sh push "feat: güncelleme"

# GitHub'dan kaynak kodu çek:
QUANTUM_DIR=/home/runner/workspace/artifacts/quantumplace bash .migration-backup/github-sync.sh pull
```

**Gereksinim:** Replit Secrets bölümünde `GITHUB_PAT` ortam değişkeninin tanımlı olması gerekir.  
**Hedef Depo:** `https://github.com/TurkYoshi1905/quantumplace.git`

Betik, Replit monorepo yapısını değil yalnızca gerçek uygulama dosyalarını (src/, public/, index.html, replit.md vb.) gönderir. `git push --force` kesinlikle kullanılmaz. Vercel build için `catalog:` bağımlılıkları otomatik çözülür ve standalone `tsconfig.json` ile `vite.config.ts` oluşturulur.

## Ortam Değişkenleri (Supabase)

| Değişken | Açıklama |
|---|---|
| `VITE_SUPABASE_URL` | Supabase proje URL'si |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonim anahtar (JWT) |

Supabase tabloları için `artifacts/quantumplace/supabase_schema.sql` dosyasını Dashboard > SQL Editor'dan çalıştırın.

## Teknik Altyapı

- **pnpm workspaces**, Node.js 24, TypeScript 5.9
- **Artifact:** `artifacts/quantumplace` — paket adı `@workspace/quantumplace`
- **Build:** Vite 7 + React 19.2 SPA
- **CSS:** Özel CSS değişkenleri (--qbg, --qcyan, --qpurple...), Tailwind CSS
- **Gerçek zamanlı:** Supabase Realtime (WebSocket, postgres_changes)

## Mimari ve Temel Dosyalar

| Dosya/Dizin | Açıklama |
|---|---|
| `src/hooks/useCanvas.ts` | Tüm canvas mantığı: RAF döngüsü, zoom/pan, crosshair render |
| `src/hooks/useIndexedDB.ts` | Piksel verisi için IndexedDB kalıcılık katmanı |
| `src/hooks/useCooldown.ts` | 1 saniyelik kuantum bekleme mekanizması |
| `src/hooks/useSupabasePixels.ts` | Supabase realtime piksel senkronizasyonu + upsert |
| `src/hooks/useSupabaseChat.ts` | Supabase realtime sohbet + son 50 mesaj yükleme |
| `src/lib/supabase.ts` | Supabase istemcisi + PixelRecord/ChatMessage tipleri |
| `src/components/HUD.tsx` | r/place tarzı kayan UI: koordinat hücresi, menü, info |
| `src/components/BottomPanel.tsx` | Kalıcı CTA butonu + yukarı kayan renk paleti |
| `src/components/ColorPicker.tsx` | 32 renkli palet + özel renk seçici |
| `src/components/InfoModal.tsx` | ? butonu → premium oyun bilgi modal (glassmorphism) |
| `src/components/ChatPanel.tsx` | Sol alt sohbet paneli, okunmamış mesaj sayacı, EN/TR |
| `src/components/PixelTooltip.tsx` | Hover tooltip: kimin koyduğu, ne zaman, koordinat |
| `src/pages/WelcomePage.tsx` | Kullanıcı adı onboarding ekranı (TR/EN, validasyon) |
| `src/i18n/translations.ts` | TR/EN çeviri anahtarları |
| `src/i18n/context.tsx` | I18n sağlayıcı ve useI18n() hook |
| `src/pages/Game.tsx` | Ana oyun sayfası |
| `src/pages/SettingsPage.tsx` | Ayarlar sayfası (dil, kontroller, hakkında) |
| `supabase_schema.sql` | Supabase SQL şeması (tablolar, RLS, realtime) |
| `vercel.json` | Vercel SPA yönlendirme + cache + güvenlik başlıkları |

## Özellikler

### Supabase Gerçek Zamanlı Senkronizasyon
- **pixels** tablosu: Her piksel değişikliği `postgres_changes` WebSocket kanalıyla tüm bağlı kullanıcılara anında iletilir.
- **upsert** stratejisi: Aynı koordinata gelen yazma istekleri çakışma olmadan güncellenir (`onConflict: "x,y"`).
- **İlk yükleme:** Bağlantı kurulduğunda tüm piksel verisi Supabase'den çekilir ve canvas'a uygulanır.
- IndexedDB önbelleğiyle hibrit çalışır — çevrimdışıyken yerel veri, online olunca Supabase verisi.

### Hoşgeldin / Onboarding Sayfası
- Kullanıcı adı zorunlu girişi (2–20 karakter, harf/rakam/_ ve - izinli).
- TR/EN otomatik dil algılama; sağ üst dil geçiş butonu.
- Glassmorphism dark kart tasarımı, arka plan grid animasyonu, neon glow efektleri.
- Kullanıcı adı localStorage'a kaydedilir; sonraki oturumda doğrudan tuvale geçilir.

### Sohbet Paneli (Sol Alt Köşe)
- **MessageCircle** ikonu toggle butonu; kapalıyken okunmamış mesaj sayacı gösterir.
- Son 50 mesaj ilk yüklemede çekilir; yeni mesajlar realtime olarak eklenir.
- Kendi mesajların sağa yaslanmış balonlar (mavi aksan); diğerlerinin solda.
- DD.MM.YYYY HH:MM formatında zaman damgaları.
- Enter tuşu ile gönderme; 300 karakter sınırı.
- Scroll-to-bottom butonu; yumuşak panel açılış/kapanış animasyonu.

### Piksel Hover Tooltip
- Fare cursor'u piksel üzerinde durduğunda renk önizlemesi, koordinat, kullanıcı adı ve tarih/saat gösterir.
- Tarih formatı: **DD.MM.YYYY HH:MM**
- Yalnızca Supabase'den gelen piksel metadata'sı olan hücreler için gösterilir.
- Sabit konumlu, pointer-events: none, canvas render'ı etkilemez.

### Görsel Mimari (r/place Standartları)
- **Uzak Görünüm:** Oyun ilk açıldığında 1000×1000 piksel tuval ekrana sığdırılarak tüm alan görüntülenir. Grid yok — temiz beyaz canvas.
- **Yakın Görünüm:** Maksimum 5x büyütme, 2x üzerinde piksel ızgarası fade-in ile beliriyor; fare imlecini takip eden köşe braket crosshair.
- Koordinat + zoom göstergesi daima ekranın üst ortasında beyaz hücre içinde gösterilir: `(X, Y) Zx`
- "Bir piksel yerleştir" butonu daima ekranın alt ortasında yer alır.

### Canvas ve Etkileşim
- **1000×1000 piksel** HTML5 Canvas üzerinde tam render
- Fare tekerleği ve çift parmak sıkıştırma ile zoom (MIN: %4, MAX: 5000%)
- Sürükleme (fare sol tuş veya tek parmak) ile kaydırma
- Tıklama/dokunma ile piksel seçimi
- URL parametresi ile koordinata atlama (`?x=&y=`)

### IndexedDB Kalıcılığı
- Tüm piksel verisi (1000×1000 × 4 byte = ~4MB) tarayıcının IndexedDB veritabanına kaydedilir.
- Sayfa yenilendiğinde tuval tamamen kayıpsız geri yüklenir.
- 600ms debounce ile güncelleme; her piksel boyamada hemen tetiklenir.

### Kuantum Bekleme (Cooldown)
- Piksel boyamadan sonra 1 saniyelik bekleme süresi aktifleşir.
- Animasyonlu halka (SVG stroke-dashoffset) ile geri sayım gösterilir.
- Bekleme sırasında CTA butonu kilitlenir ve süre gösterilir.

### Info Modal (Sağ Üst ? Butonu)
- Premium glassmorphism dark modal — oyun hakkında tüm bilgiler.
- Stats bar: Piksel sayısı, max zoom, renk sayısı, dil desteği.
- Kontroller rehberi (simgeli), özellikler listesi, URL ipucu.
- ESC ile kapanma, backdrop tıklama ile kapanma. TR/EN dil desteği.

### Çoklu Dil (TR/EN)
- Tüm arayüz metinleri çevrilebilir (`TranslationKey` türü ile)
- Ayarlar sayfasından dil değiştirilebilir
- Seçilen dil localStorage'a kaydedilir; tarayıcı dili otomatik algılanır

### Vercel Deployment
- `vercel.json`: SPA rewrite (`/*` → `/index.html`), asset cache (1 yıl), güvenlik başlıkları
- Vercel ortam değişkenleri: `VITE_SUPABASE_URL` ve `VITE_SUPABASE_ANON_KEY` eklenmelidir
- `catalog:` bağımlılıkları push sırasında gerçek sürümlere çözülür

## Mimari Kararlar

- **RAF döngüsü yalnızca bir kez başlatılır:** `useEffect([], [])` ile kurulur, refs aracılığıyla state'siz çalışır. RAF yeniden başlatılmaz; yeniden render gerektirilmez.
- **`any` tip kullanılmaz:** Tüm TypeScript tip tanımları katı ve eksiksizdir.
- **CSS özel değişkenler:** Tailwind utility sınıfları değil, `--q*` değişken sistemi kullanılır; tema tutarlılığı sağlar.
- **Offscreen canvas:** Pixel verisini 4MB Uint8ClampedArray'de tutar; her render'da `drawImage()` ile ekran canvas'ına kopyalar.
- **Callback ref:** Canvas elementi için `useCallback` tabanlı ref; ResizeObserver ile boyut uyumu sağlanır.
- **Grid stratejisi:** Uzaktan (scale < 2) grid yok — temiz r/place görünümü. 2x üzerinde piksel grid fade-in ile devreye girer.
- **Supabase upsert:** Piksel çakışması olmaz; her (x,y) koordinatı için her zaman en son renk/kullanıcı saklanır.
- **Hibrit kalıcılık:** IndexedDB (hızlı yerel erişim) + Supabase (çok oyunculu gerçek zamanlı). İlk yükleme sırasında Supabase verisi IndexedDB'nin üzerine yazılır.

## Kullanıcı Tercihleri

- Tüm yeni bileşenler TypeScript strict modda, `any` kullanılmadan yazılır.
- Piksel verisi, cooldown: production-ready düzeyinde uygulanmıştır.
- Crosshair: fare imlecini ekranda takip eden köşe braket (r/place standardı).
- GitHub sync: `--force` olmadan, yalnızca uygulama dosyaları gönderilir.
- Canvas boyutu: **1000×1000 piksel** (kalite değil tuval sınırı).
- Grid: **sadece 2x üzeri zoom'da** görünür — uzaktan temiz beyaz canvas.
- Tooltip tarih formatı: **DD.MM.YYYY HH:MM** (Türkçe standart).
