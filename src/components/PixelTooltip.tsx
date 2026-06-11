import type { PixelCoord } from "../types";

interface PixelMeta {
  username: string;
  placed_at: string;
  color: string;
}

interface PixelTooltipProps {
  pixel: PixelCoord | null;
  meta: PixelMeta | null;
  screenX: number;
  screenY: number;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function PixelTooltip({ pixel, meta, screenX, screenY }: PixelTooltipProps) {
  if (!pixel || !meta) return null;

  const left = screenX + 14;
  const top = screenY - 8;

  return (
    <div
      className="pixel-tooltip"
      style={{ left, top }}
      aria-hidden="true"
    >
      <div className="pixel-tooltip-row">
        <div
          className="pixel-tooltip-swatch"
          style={{ backgroundColor: meta.color }}
        />
        <span className="pixel-tooltip-coord">
          ({pixel.x}, {pixel.y})
        </span>
      </div>
      <div className="pixel-tooltip-info">
        <span className="pixel-tooltip-label">👤</span>
        <span className="pixel-tooltip-username">{meta.username}</span>
      </div>
      <div className="pixel-tooltip-info">
        <span className="pixel-tooltip-label">🕐</span>
        <span className="pixel-tooltip-time">{formatDate(meta.placed_at)}</span>
      </div>
    </div>
  );
}
