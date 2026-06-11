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

/**
 * Supabase timestamptz bazen timezone bilgisi olmadan döner (ör: "2026-06-11T09:09:00").
 * Bu durumda JS onu local zaman olarak yorumlar ve saat yanlış görünür.
 * Çözüm: timezone bilgisi yoksa 'Z' ekleyerek UTC olarak işaretle,
 * sonra getHours() ile yerel saate çevir.
 */
function parseTimestamp(iso: string): Date {
  let s = iso.replace(" ", "T"); // PostgreSQL "2026-06-11 09:09:00" formatı
  // Eğer timezone bilgisi yoksa UTC'ye zorla
  if (!s.endsWith("Z") && !/[+\-]\d{2}:\d{2}$/.test(s) && !/[+\-]\d{4}$/.test(s)) {
    s += "Z";
  }
  return new Date(s);
}

function formatDate(iso: string): string {
  const d = parseTimestamp(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function PixelTooltip({ pixel, meta, screenX, screenY }: PixelTooltipProps) {
  if (!pixel || !meta) return null;

  // Tooltip ekranın sağından taşmasın
  const left = Math.min(screenX + 14, window.innerWidth - 230);
  const top  = Math.max(screenY - 8, 8);

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
