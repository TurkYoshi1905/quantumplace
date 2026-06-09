import { useState } from "react";
import { Check, X, Link2, Copy, CheckCheck } from "lucide-react";
import { ColorPicker } from "./ColorPicker";
import { CooldownTimer } from "./CooldownTimer";
import { useI18n } from "../i18n/context";
import type { ColorHex, PixelCoord, UseCooldownReturn } from "../types";

interface BottomPanelProps {
  selectedPixel: PixelCoord | null;
  activeColor: ColorHex;
  onColorChange: (c: ColorHex) => void;
  onPlace: () => void;
  onCancel: () => void;
  cooldown: UseCooldownReturn;
  onOpenPicker: () => void;
}

export function BottomPanel({
  selectedPixel,
  activeColor,
  onColorChange,
  onPlace,
  onCancel,
  cooldown,
  onOpenPicker,
}: BottomPanelProps) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const { isOnCooldown } = cooldown;
  const isOpen = selectedPixel !== null;

  const handleInvite = async () => {
    if (!selectedPixel) return;
    const url = new URL(window.location.href);
    url.searchParams.set("x", String(selectedPixel.x));
    url.searchParams.set("y", String(selectedPixel.y));
    try {
      await navigator.clipboard.writeText(url.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      prompt("Copy this invite link:", url.toString());
    }
  };

  return (
    <div className="bottom-zone">
      {/* Slide-up color picker panel */}
      <div className={`picker-panel ${isOpen ? "picker-panel--open" : ""}`}>
        <div className="picker-panel-inner">

          {/* Header row */}
          <div className="pp-header">
            <div className="pp-pixel-info">
              <div className="pp-swatch" style={{ backgroundColor: activeColor }} />
              {selectedPixel && (
                <span className="pp-coords">({selectedPixel.x}, {selectedPixel.y})</span>
              )}
            </div>
            <div className="pp-header-actions">
              <button
                className={`pp-invite-btn ${copied ? "pp-invite-btn--copied" : ""}`}
                onClick={handleInvite}
                disabled={!selectedPixel}
              >
                {copied
                  ? <><CheckCheck size={12} /><span>{t("panel.copied")}</span></>
                  : <><Link2 size={12} /><Copy size={10} /><span>{t("panel.invite")}</span></>
                }
              </button>
              <button className="pp-close-btn" onClick={onCancel}>
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Color picker */}
          <div className="pp-palette-wrap">
            <ColorPicker activeColor={activeColor} onColorChange={onColorChange} />
          </div>

          {/* Place / cooldown */}
          <div className="pp-footer">
            {isOnCooldown ? (
              <div className="pp-cooldown-row">
                <CooldownTimer cooldown={cooldown} />
              </div>
            ) : (
              <button
                className={`pp-place-btn ${selectedPixel && !isOnCooldown ? "pp-place-btn--ready" : ""}`}
                onClick={onPlace}
                disabled={!selectedPixel || isOnCooldown}
              >
                <Check size={15} />
                <span>{t("panel.place")}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Permanent CTA pill button at bottom */}
      <div className="bottom-cta">
        <button
          className={`cta-btn ${isOnCooldown ? "cta-btn--cooldown" : ""} ${isOpen && !isOnCooldown ? "cta-btn--active" : ""}`}
          onClick={isOpen ? (isOnCooldown ? undefined : onPlace) : onOpenPicker}
          disabled={isOnCooldown}
        >
          {isOnCooldown ? (
            <span className="cta-cooldown-text">
              <CooldownTimer cooldown={cooldown} inline />
            </span>
          ) : (
            t("panel.place.action")
          )}
        </button>
      </div>
    </div>
  );
}
