import { useEffect, useRef } from "react";
import { X, MousePointer2, Scroll, Move, Palette, Clock, Globe } from "lucide-react";
import { useI18n } from "../i18n/context";

interface InfoModalProps {
  open: boolean;
  onClose: () => void;
}

export function InfoModal({ open, onClose }: InfoModalProps) {
  const { lang } = useI18n();
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const tr = {
    title:       lang === "tr" ? "QuantumPlace Hakkında" : "About QuantumPlace",
    subtitle:    lang === "tr" ? "İşbirlikçi Piksel Boyama Tuali" : "Collaborative Pixel Canvas",
    desc:        lang === "tr"
      ? "QuantumPlace, r/place'ten ilham alınan kuantum temalı işbirlikçi bir piksel sanat oyunudur. 2048×2048 piksellik devasa bir tuval üzerinde, dünya genelindeki oyuncularla birlikte piksel piksel sanat eserleri yaratın."
      : "QuantumPlace is a quantum-themed collaborative pixel art game inspired by r/place. Create pixel-by-pixel masterpieces with players worldwide on a massive 2048×2048 canvas.",
    controls:    lang === "tr" ? "Kontroller" : "Controls",
    ctrl_zoom:   lang === "tr" ? "Fare tekerleği ile yakınlaştır / uzaklaştır" : "Mouse wheel to zoom in / out",
    ctrl_pan:    lang === "tr" ? "Sol tıkla sürükleyerek haritayı gez" : "Left-click drag to pan the map",
    ctrl_place:  lang === "tr" ? "Piksel seç → renk seç → 'Piksel Yerleştir'" : "Select pixel → pick color → Place",
    ctrl_cool:   lang === "tr" ? "Her piksel sonrası 1 saniyelik kuantum bekleme" : "1-second quantum cooldown between placements",
    features:    lang === "tr" ? "Özellikler" : "Features",
    f1:          lang === "tr" ? "2048×2048 piksel tuval — 4M+ piksel alanı" : "2048×2048 canvas — 4M+ pixel space",
    f2:          lang === "tr" ? "32 renkli palet + özel renk seçici" : "32-color palette + custom color picker",
    f3:          lang === "tr" ? "IndexedDB ile tarayıcıda kalıcı saklama" : "Persistent storage via IndexedDB",
    f4:          lang === "tr" ? "TR / EN tam çoklu dil desteği" : "Full TR / EN multilanguage support",
    f5:          lang === "tr" ? "Maksimum 5× yakınlaştırma" : "Up to 5× zoom level",
    zoom:        lang === "tr" ? "5× Max Zoom" : "5× Max Zoom",
    pixels:      lang === "tr" ? "4M+ Piksel" : "4M+ Pixels",
    langs:       lang === "tr" ? "2 Dil" : "2 Languages",
    tip:         lang === "tr" ? "💡 İpucu: URL'ye ?x=1024&y=1024 ekleyerek tuvalin ortasına ışınlanabilirsiniz!" : "💡 Tip: Add ?x=1024&y=1024 to the URL to teleport to the center of the canvas!",
    close:       lang === "tr" ? "Kapat" : "Close",
  };

  return (
    <div
      ref={backdropRef}
      className="info-modal-backdrop"
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
    >
      <div className="info-modal">
        {/* Header */}
        <div className="info-modal__header">
          <div className="info-modal__logo">
            <span className="info-modal__logo-q">Q</span>
          </div>
          <div>
            <h1 className="info-modal__title">{tr.title}</h1>
            <p className="info-modal__subtitle">{tr.subtitle}</p>
          </div>
          <button className="info-modal__close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Stats bar */}
        <div className="info-modal__stats">
          <div className="info-modal__stat">
            <span className="info-modal__stat-value">{tr.pixels}</span>
            <span className="info-modal__stat-label">Canvas</span>
          </div>
          <div className="info-modal__stat-divider" />
          <div className="info-modal__stat">
            <span className="info-modal__stat-value">{tr.zoom}</span>
            <span className="info-modal__stat-label">{lang === "tr" ? "Zoom" : "Zoom"}</span>
          </div>
          <div className="info-modal__stat-divider" />
          <div className="info-modal__stat">
            <span className="info-modal__stat-value">32+</span>
            <span className="info-modal__stat-label">{lang === "tr" ? "Renk" : "Colors"}</span>
          </div>
          <div className="info-modal__stat-divider" />
          <div className="info-modal__stat">
            <span className="info-modal__stat-value">{tr.langs}</span>
            <span className="info-modal__stat-label">{lang === "tr" ? "Dil" : "Languages"}</span>
          </div>
        </div>

        {/* Description */}
        <p className="info-modal__desc">{tr.desc}</p>

        {/* Controls */}
        <div className="info-modal__section">
          <h2 className="info-modal__section-title">{tr.controls}</h2>
          <div className="info-modal__controls">
            <div className="info-modal__ctrl">
              <div className="info-modal__ctrl-icon"><Scroll size={15} /></div>
              <span>{tr.ctrl_zoom}</span>
            </div>
            <div className="info-modal__ctrl">
              <div className="info-modal__ctrl-icon"><Move size={15} /></div>
              <span>{tr.ctrl_pan}</span>
            </div>
            <div className="info-modal__ctrl">
              <div className="info-modal__ctrl-icon"><MousePointer2 size={15} /></div>
              <span>{tr.ctrl_place}</span>
            </div>
            <div className="info-modal__ctrl">
              <div className="info-modal__ctrl-icon"><Clock size={15} /></div>
              <span>{tr.ctrl_cool}</span>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="info-modal__section">
          <h2 className="info-modal__section-title">{tr.features}</h2>
          <div className="info-modal__features">
            {[tr.f1, tr.f2, tr.f3, tr.f4, tr.f5].map((f, i) => (
              <div key={i} className="info-modal__feature">
                <span className="info-modal__feature-dot" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tip */}
        <div className="info-modal__tip">{tr.tip}</div>

        {/* Footer */}
        <div className="info-modal__footer">
          <div className="info-modal__footer-brand">
            <Globe size={12} />
            <span>QuantumPlace © 2026</span>
          </div>
          <button className="info-modal__close-btn" onClick={onClose}>
            {tr.close}
          </button>
        </div>
      </div>
    </div>
  );
}
