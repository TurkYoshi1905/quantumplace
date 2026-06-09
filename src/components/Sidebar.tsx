import { ColorPicker } from "./ColorPicker";
import { CooldownTimer } from "./CooldownTimer";
import type { ColorHex, PixelCoord, UseCooldownReturn } from "../types";

interface SidebarProps {
  activeColor: ColorHex;
  onColorChange: (color: ColorHex) => void;
  selectedPixel: PixelCoord | null;
  onPlacePixel: () => void;
  cooldown: UseCooldownReturn;
}

export function Sidebar({
  activeColor,
  onColorChange,
  selectedPixel,
  onPlacePixel,
  cooldown,
}: SidebarProps) {
  const { isOnCooldown } = cooldown;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="logo-q">Q</span>
          <span className="logo-text">uantumPlace</span>
        </div>
        <div className="sidebar-tagline">2048 × 2048 Canvas</div>
      </div>

      <ColorPicker activeColor={activeColor} onColorChange={onColorChange} />

      <div className="selected-pixel-section">
        <div className="section-title">Selected Pixel</div>
        {selectedPixel ? (
          <div className="pixel-info">
            <div className="pixel-coord-row">
              <span className="pixel-coord-label">X:</span>
              <span className="pixel-coord-val">{selectedPixel.x}</span>
              <span className="pixel-coord-label">Y:</span>
              <span className="pixel-coord-val">{selectedPixel.y}</span>
            </div>
            <div
              className="pixel-preview"
              style={{ backgroundColor: activeColor }}
            />
          </div>
        ) : (
          <div className="no-pixel-hint">Click on the canvas to select a pixel</div>
        )}
      </div>

      <div className="place-button-section">
        <CooldownTimer cooldown={cooldown} />
        <button
          className={`place-button ${isOnCooldown ? "place-button--disabled" : ""} ${
            selectedPixel && !isOnCooldown ? "place-button--ready" : ""
          }`}
          onClick={onPlacePixel}
          disabled={isOnCooldown || !selectedPixel}
        >
          {isOnCooldown ? (
            <span className="place-button-inner">
              <span className="cooldown-icon">⏳</span>
              <span>Quantum Cooldown</span>
            </span>
          ) : (
            <span className="place-button-inner">
              <span className="pixel-icon">⬛</span>
              <span>Place Pixel</span>
            </span>
          )}
        </button>
      </div>

      <div className="sidebar-footer">
        <div className="hint-item">
          <kbd className="kbd">Scroll</kbd> Zoom
        </div>
        <div className="hint-item">
          <kbd className="kbd">Drag</kbd> Pan
        </div>
        <div className="hint-item">
          <kbd className="kbd">Click</kbd> Select
        </div>
      </div>
    </aside>
  );
}
