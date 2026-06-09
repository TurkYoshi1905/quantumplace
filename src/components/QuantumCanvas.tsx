import { useI18n } from "../i18n/context";
import type { UseCanvasReturn } from "../types";

interface QuantumCanvasProps {
  canvasHook: UseCanvasReturn;
}

export function QuantumCanvas({ canvasHook }: QuantumCanvasProps) {
  const { t } = useI18n();
  const {
    canvasRef, isLoaded,
    handleMouseDown, handleMouseMove,
    handleMouseUp, handleMouseLeave, handleClick,
  } = canvasHook;

  return (
    <div className="canvas-viewport">
      {!isLoaded && (
        <div className="canvas-loading">
          <div className="loading-spinner" />
          <span className="loading-text">{t("canvas.loading")}</span>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="quantum-canvas"
        style={{ opacity: isLoaded ? 1 : 0 }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      />
    </div>
  );
}
