import { useI18n } from "../i18n/context";
import type { ColorHex } from "../types";

export const PALETTE: ColorHex[] = [
  "#ffffff", "#e4e4e4", "#888888", "#444444",
  "#000000", "#1a1a2e", "#16213e", "#0f3460",
  "#ff0000", "#ff4500", "#ff8c00", "#ffd700",
  "#7fff00", "#00cc44", "#00ffcc", "#00e5ff",
  "#0066ff", "#3300ff", "#7700ff", "#b300ff",
  "#ff00ff", "#ff0099", "#ff3366", "#ff6666",
  "#ff9966", "#ffcc66", "#ccff66", "#66ff99",
  "#66ffff", "#66ccff", "#9966ff", "#ff66cc",
];

interface ColorPickerProps {
  activeColor: ColorHex;
  onColorChange: (color: ColorHex) => void;
}

export function ColorPicker({ activeColor, onColorChange }: ColorPickerProps) {
  const { t } = useI18n();

  return (
    <div className="cp-root">
      <div className="palette-grid">
        {PALETTE.map((hex) => (
          <button
            key={hex}
            className={`palette-swatch ${activeColor === hex ? "palette-swatch--active" : ""}`}
            style={{ backgroundColor: hex }}
            onClick={() => onColorChange(hex)}
            title={hex}
            aria-label={`Select color ${hex}`}
          />
        ))}
      </div>

      <div className="cp-custom-row">
        <label className="cp-custom-label">{t("panel.custom")}</label>
        <div className="cp-custom-right">
          <input
            type="color"
            value={activeColor.length === 7 ? activeColor : "#00e5ff"}
            onChange={(e) => onColorChange(e.target.value)}
            className="cp-color-input"
            aria-label={t("panel.custom")}
          />
          <span className="cp-hex">{activeColor.toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
}
