import {
  ArrowLeft,
  Globe,
  Monitor,
  ZoomIn,
  Info,
  MousePointer2,
  Smartphone,
} from "lucide-react";
import { useI18n } from "../i18n/context";
import type { Lang } from "../i18n/translations";

interface SettingsPageProps {
  onBack: () => void;
}

export default function SettingsPage({ onBack }: SettingsPageProps) {
  const { lang, setLang, t } = useI18n();

  const langs: { value: Lang; label: string; native: string }[] = [
    { value: "en", label: "English", native: "English" },
    { value: "tr", label: "Turkish", native: "Türkçe" },
  ];

  return (
    <div className="settings-root">
      <div className="settings-topbar">
        <button className="settings-back-btn" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>{t("settings.back")}</span>
        </button>
        <span className="settings-title-text">{t("settings.title")}</span>
        <div style={{ width: 100 }} />
      </div>

      <div className="settings-body">

        {/* Language */}
        <section className="settings-section">
          <div className="settings-section-header">
            <Globe size={15} className="settings-section-icon" />
            <h2 className="settings-section-title">{t("settings.language")}</h2>
          </div>
          <p className="settings-section-desc">{t("settings.language.desc")}</p>
          <div className="lang-selector">
            {langs.map((l) => (
              <button
                key={l.value}
                className={`lang-btn ${lang === l.value ? "lang-btn--active" : ""}`}
                onClick={() => setLang(l.value)}
              >
                <span className="lang-flag">
                  {l.value === "en" ? "🇬🇧" : "🇹🇷"}
                </span>
                <span className="lang-native">{l.native}</span>
                {lang === l.value && (
                  <span className="lang-check">✓</span>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Canvas Info */}
        <section className="settings-section">
          <div className="settings-section-header">
            <Monitor size={15} className="settings-section-icon" />
            <h2 className="settings-section-title">{t("settings.canvas.size")}</h2>
          </div>
          <div className="settings-info-row">
            <span className="settings-info-label">{t("settings.canvas.size")}</span>
            <span className="settings-info-val">2048 × 2048</span>
          </div>
          <div className="settings-info-row">
            <div className="settings-info-label-wrap">
              <ZoomIn size={12} />
              <span className="settings-info-label">{t("settings.max.zoom")}</span>
            </div>
            <span className="settings-info-val">200%</span>
          </div>
        </section>

        {/* Controls */}
        <section className="settings-section">
          <div className="settings-section-header">
            <MousePointer2 size={15} className="settings-section-icon" />
            <h2 className="settings-section-title">{t("settings.controls")}</h2>
          </div>
          <ul className="settings-controls-list">
            <li className="settings-control-item">
              <span className="settings-control-icon"><Monitor size={13} /></span>
              <span>{t("settings.controls.scroll")}</span>
            </li>
            <li className="settings-control-item">
              <span className="settings-control-icon"><MousePointer2 size={13} /></span>
              <span>{t("settings.controls.drag")}</span>
            </li>
            <li className="settings-control-item">
              <span className="settings-control-icon"><MousePointer2 size={13} /></span>
              <span>{t("settings.controls.tap")}</span>
            </li>
            <li className="settings-control-item">
              <span className="settings-control-icon"><Smartphone size={13} /></span>
              <span>{t("settings.controls.pinch")}</span>
            </li>
          </ul>
        </section>

        {/* About */}
        <section className="settings-section">
          <div className="settings-section-header">
            <Info size={15} className="settings-section-icon" />
            <h2 className="settings-section-title">{t("settings.about")}</h2>
          </div>
          <p className="settings-about-text">{t("settings.about.text")}</p>
          <div className="settings-version">
            <span className="logo-q">Q</span>
            <span style={{ color: "var(--qtext-muted)", fontSize: 12 }}>uantumPlace v1.0</span>
          </div>
        </section>

      </div>
    </div>
  );
}
