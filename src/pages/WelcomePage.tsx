import { useState, useRef, useEffect } from "react";
import { Sparkles, User, ArrowRight, Globe } from "lucide-react";

interface WelcomePageProps {
  onEnter: (username: string) => void;
}

const LANG_TEXTS = {
  en: {
    subtitle: "A collaborative pixel canvas — paint together in real time",
    label: "Your display name",
    placeholder: "Enter your username...",
    cta: "Enter Canvas",
    note: "Your name will be visible on pixels you place and in chat.",
    tagline: "Real-time · 1000×1000 · Infinite creativity",
  },
  tr: {
    subtitle: "Gerçek zamanlı birlikte piksel boyama tuvali",
    label: "Görünen adınız",
    placeholder: "Kullanıcı adınızı girin...",
    cta: "Tuvale Gir",
    note: "Adınız yerleştirdiğiniz piksellerde ve sohbette görünecektir.",
    tagline: "Gerçek zamanlı · 1000×1000 · Sonsuz yaratıcılık",
  },
};

export default function WelcomePage({ onEnter }: WelcomePageProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [lang, setLang] = useState<"en" | "tr">(() => {
    const br = navigator.language.toLowerCase();
    return br.startsWith("tr") ? "tr" : "en";
  });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const t = LANG_TEXTS[lang];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      setError(lang === "tr" ? "Kullanıcı adı boş olamaz." : "Username cannot be empty.");
      return;
    }
    if (trimmed.length < 2) {
      setError(lang === "tr" ? "En az 2 karakter giriniz." : "Minimum 2 characters required.");
      return;
    }
    if (trimmed.length > 20) {
      setError(lang === "tr" ? "En fazla 20 karakter kullanabilirsiniz." : "Maximum 20 characters allowed.");
      return;
    }
    if (!/^[a-zA-Z0-9_\-\u00C0-\u017E]+$/.test(trimmed)) {
      setError(lang === "tr" ? "Yalnızca harf, rakam, _ ve - kullanabilirsiniz." : "Only letters, numbers, _ and - are allowed.");
      return;
    }
    localStorage.setItem("qp_username", trimmed);
    onEnter(trimmed);
  };

  return (
    <div className="welcome-root">
      {/* Background grid pattern */}
      <div className="welcome-bg-grid" />

      {/* Glow orbs */}
      <div className="welcome-orb welcome-orb--cyan" />
      <div className="welcome-orb welcome-orb--purple" />

      {/* Language toggle */}
      <div className="welcome-lang-toggle">
        <button
          className={`welcome-lang-btn ${lang === "en" ? "welcome-lang-btn--active" : ""}`}
          onClick={() => setLang("en")}
        >
          EN
        </button>
        <span className="welcome-lang-divider" />
        <button
          className={`welcome-lang-btn ${lang === "tr" ? "welcome-lang-btn--active" : ""}`}
          onClick={() => setLang("tr")}
        >
          TR
        </button>
      </div>

      {/* Main card */}
      <div className="welcome-card">
        {/* Logo */}
        <div className="welcome-logo">
          <div className="welcome-logo-icon">
            <span className="welcome-logo-q">Q</span>
          </div>
          <div>
            <h1 className="welcome-title">QuantumPlace</h1>
            <p className="welcome-subtitle">{t.subtitle}</p>
          </div>
        </div>

        {/* Stats strip */}
        <div className="welcome-stats">
          <div className="welcome-stat">
            <span className="welcome-stat-val">1000×1000</span>
            <span className="welcome-stat-lbl">{lang === "tr" ? "Tuval" : "Canvas"}</span>
          </div>
          <div className="welcome-stat-div" />
          <div className="welcome-stat">
            <span className="welcome-stat-val">32</span>
            <span className="welcome-stat-lbl">{lang === "tr" ? "Renk" : "Colors"}</span>
          </div>
          <div className="welcome-stat-div" />
          <div className="welcome-stat">
            <span className="welcome-stat-val">∞</span>
            <span className="welcome-stat-lbl">{lang === "tr" ? "Oyuncu" : "Players"}</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="welcome-form">
          <label className="welcome-label">
            <User size={14} style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }} />
            {t.label}
          </label>
          <div className="welcome-input-wrap">
            <input
              ref={inputRef}
              type="text"
              className={`welcome-input ${error ? "welcome-input--error" : ""}`}
              placeholder={t.placeholder}
              value={value}
              maxLength={20}
              onChange={(e) => {
                setValue(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit(e as unknown as React.FormEvent);
              }}
              autoComplete="off"
              spellCheck={false}
            />
            <span className="welcome-input-count">{value.length}/20</span>
          </div>
          {error && <p className="welcome-error">{error}</p>}
          <p className="welcome-note">{t.note}</p>

          <button
            type="submit"
            className="welcome-cta"
            disabled={!value.trim()}
          >
            <Sparkles size={16} />
            <span>{t.cta}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Footer tagline */}
        <div className="welcome-footer">
          <Globe size={12} />
          <span>{t.tagline}</span>
        </div>
      </div>
    </div>
  );
}
