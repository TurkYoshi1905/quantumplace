import { Menu, HelpCircle } from "lucide-react";
import { useI18n } from "../i18n/context";
import type { PixelCoord } from "../types";

interface HUDProps {
  displayCoord: PixelCoord;
  zoomDisplay: string;
  onOpenSettings: () => void;
}

export function HUD({ displayCoord, zoomDisplay, onOpenSettings }: HUDProps) {
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

      {/* Top-right info button */}
      <button className="hud-btn hud-btn--right" onClick={onOpenSettings} title={t("settings.about")}>
        <HelpCircle size={16} />
      </button>
    </>
  );
}
