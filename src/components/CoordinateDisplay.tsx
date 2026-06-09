import type { PixelCoord } from "../types";

interface CoordinateDisplayProps {
  coord: PixelCoord | null;
  zoomPercent: number;
}

export function CoordinateDisplay({ coord, zoomPercent }: CoordinateDisplayProps) {
  return (
    <div className="coord-display">
      <div className="coord-item">
        <span className="coord-label">X</span>
        <span className="coord-value">{coord ? coord.x : "—"}</span>
      </div>
      <div className="coord-divider" />
      <div className="coord-item">
        <span className="coord-label">Y</span>
        <span className="coord-value">{coord ? coord.y : "—"}</span>
      </div>
      <div className="coord-divider" />
      <div className="coord-item">
        <span className="coord-label">ZOOM</span>
        <span className="coord-value zoom-value">{zoomPercent}%</span>
      </div>
    </div>
  );
}
