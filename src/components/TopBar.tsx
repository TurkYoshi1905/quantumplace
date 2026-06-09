import { Crosshair, ZoomIn, ZoomOut, Layers, Settings } from "lucide-react";
import { useI18n } from "../i18n/context";
import type { PixelCoord } from "../types";

interface TopBarProps {
  cursorCoord: PixelCoord | null;
  zoomPercent: number;
  selectedPixel: PixelCoord | null;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onOpenSettings: () => void;
}

export function TopBar({
  cursorCoord,
  zoomPercent,
  selectedPixel,
  onZoomIn,
  onZoomOut,
  onOpenSettings,
}: TopBarProps) {
  const { t } = useI18n();
  const displayCoord = cursorCoord ?? selectedPixel;

  return (
    <div className="topbar">
      <div className="topbar-logo">
        <span className="logo-q">Q</span>
        <span className="logo-text">uantumPlace</span>
      </div>

      <div className="topbar-stats">
        {displayCoord && (
          <div className="stat-chip">
            {cursorCoord ? (
              <Crosshair size={10} className="stat-icon" />
            ) : (
              <Layers size={10} className="stat-icon" />
            )}
            <span className="stat-val">{displayCoord.x}</span>
            <span className="stat-sep">,</span>
            <span className="stat-val">{displayCoord.y}</span>
          </div>
        )}

        <div className="stat-chip stat-chip--zoom">
          <button className="zoom-btn" onClick={onZoomOut} title={t("topbar.zoom")}>
            <ZoomOut size={13} />
          </button>
          <span className="stat-val stat-val--zoom">{zoomPercent}%</span>
          <button className="zoom-btn" onClick={onZoomIn} title={t("topbar.zoom")}>
            <ZoomIn size={13} />
          </button>
        </div>
      </div>

      <button className="settings-open-btn" onClick={onOpenSettings} title={t("settings.title")}>
        <Settings size={15} />
      </button>
    </div>
  );
}
