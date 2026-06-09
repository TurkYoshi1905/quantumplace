export type Lang = "en" | "tr";

export type TranslationKey =
  | "settings.title"
  | "settings.back"
  | "settings.language"
  | "settings.language.desc"
  | "settings.about"
  | "settings.about.text"
  | "settings.canvas.size"
  | "settings.max.zoom"
  | "settings.controls"
  | "settings.controls.scroll"
  | "settings.controls.drag"
  | "settings.controls.tap"
  | "settings.controls.pinch"
  | "canvas.loading"
  | "panel.invite"
  | "panel.copied"
  | "panel.place"
  | "panel.place.action"
  | "panel.cooldown"
  | "panel.custom"
  | "panel.color.matrix"
  | "panel.hint.select"
  | "panel.cancel"
  | "topbar.zoom";

type Translations = Record<TranslationKey, string>;

export const translations: Record<Lang, Translations> = {
  en: {
    "settings.title": "Settings",
    "settings.back": "Back to Canvas",
    "settings.language": "Language",
    "settings.language.desc": "Choose the display language for the interface.",
    "settings.about": "About",
    "settings.about.text":
      "QuantumPlace is a collaborative pixel art canvas inspired by r/place. Paint one pixel at a time and build something amazing together. Your pixels are saved locally in your browser using IndexedDB.",
    "settings.canvas.size": "Canvas Size",
    "settings.max.zoom": "Max Zoom",
    "settings.controls": "Controls",
    "settings.controls.scroll": "Mouse wheel / Pinch — Zoom in & out",
    "settings.controls.drag": "Left click drag / Single finger — Pan canvas",
    "settings.controls.tap": "Click / Tap — Select a pixel",
    "settings.controls.pinch": "Two fingers — Pinch to zoom (mobile)",
    "canvas.loading": "Loading quantum canvas…",
    "panel.invite": "Invite",
    "panel.copied": "Copied!",
    "panel.place": "Place Pixel",
    "panel.place.action": "Place a pixel",
    "panel.cooldown": "Quantum Cooldown",
    "panel.custom": "Custom",
    "panel.color.matrix": "Color Matrix",
    "panel.hint.select": "Click on the canvas to select a pixel",
    "panel.cancel": "Cancel",
    "topbar.zoom": "Zoom",
  },
  tr: {
    "settings.title": "Ayarlar",
    "settings.back": "Tuvale Dön",
    "settings.language": "Dil",
    "settings.language.desc": "Arayüzün görüntüleme dilini seçin.",
    "settings.about": "Hakkında",
    "settings.about.text":
      "QuantumPlace, r/place'ten ilham alan işbirlikçi bir piksel sanat tuvalidir. Bir seferde bir piksel boyayın ve birlikte harika şeyler yaratın. Pikselleriniz, IndexedDB kullanılarak tarayıcınızda yerel olarak kaydedilir.",
    "settings.canvas.size": "Tuval Boyutu",
    "settings.max.zoom": "Maks. Yakınlaştırma",
    "settings.controls": "Kontroller",
    "settings.controls.scroll": "Fare tekerleği / Sıkıştırma — Yakınlaştır & uzaklaştır",
    "settings.controls.drag": "Sol tık sürükle / Tek parmak — Tuvelde gezin",
    "settings.controls.tap": "Tıkla / Dokun — Piksel seç",
    "settings.controls.pinch": "İki parmak — Sıkıştırarak yakınlaştır (mobil)",
    "canvas.loading": "Kuantum tuvali yükleniyor…",
    "panel.invite": "Davet Et",
    "panel.copied": "Kopyalandı!",
    "panel.place": "Piksel Yerleştir",
    "panel.place.action": "Bir piksel yerleştir",
    "panel.cooldown": "Kuantum Bekleme",
    "panel.custom": "Özel",
    "panel.color.matrix": "Renk Matrisi",
    "panel.hint.select": "Piksel seçmek için tuvale tıklayın",
    "panel.cancel": "İptal",
    "topbar.zoom": "Yakınlaştırma",
  },
};
