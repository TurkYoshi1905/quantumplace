import { Menu, HelpCircle, Users } from "lucide-react";
import { useI18n } from "../i18n/context";
import type { PixelCoord } from "../types";

interface HUDProps {
  displayCoord: PixelCoord;
  zoomDisplay: string;
  onOpenSettings: () => void;
  onOpenInfo: () => void;
  onlineCount?: number;
}

export function HUD({ displayCoord, zoomDisplay, onOpenSettings, onOpenInfo, onlineCount = 0 }: HUDProps) {
  const { t } = useI18n();

  return (
    <>
      {/* Top-left menu button */}
      <button className="hud-btn hud-btn--left" onClick={onOpenSettings} title={t("settings.title")}>
        <Menu size={16} />
      </button>

      {/* Top-center coordinate + zoom pill */}
      <div className="hud-coord-pill">
        <span className="hud-coord">
          ({displayCoord.x}, {displayCoord.y})
        </span>
        <span className="hud-divider" />
        <span className="hud-zoom">{zoomDisplay}</span>
      </div>

      {/* Online player count — top center-right */}
      {onlineCount > 0 && (
        <div className="hud-online-pill">
          <div className="hud-online-dot" />
          <Users size={11} />
          <span className="hud-online-count">{onlineCount}</span>
        </div>
      )}

      {/* Top-right info button */}
      <button className="hud-btn hud-btn--right" onClick={onOpenInfo} title={t("settings.about")}>
        <HelpCircle size={16} />
      </button>
    </>
  );
}
