import { useState, useEffect, useCallback, useRef } from "react";
import { QuantumCanvas } from "../components/QuantumCanvas";
import { BottomPanel } from "../components/BottomPanel";
import { HUD } from "../components/HUD";
import { InfoModal } from "../components/InfoModal";
import { ChatPanel } from "../components/ChatPanel";
import { PixelTooltip } from "../components/PixelTooltip";
import { useCanvas } from "../hooks/useCanvas";
import { useCooldown } from "../hooks/useCooldown";
import { useSupabasePixels } from "../hooks/useSupabasePixels";
import type { ColorHex, PixelCoord } from "../types";

interface PixelMeta {
  username: string;
  placed_at: string;
  color: string;
}

interface GameProps {
  onOpenSettings: () => void;
  username: string;
}

export default function Game({ onOpenSettings, username }: GameProps) {
  const [activeColor,    setActiveColor]    = useState<ColorHex>("#ff4500");
  const [pickerOpen,     setPickerOpen]     = useState(false);
  const [infoOpen,       setInfoOpen]       = useState(false);
  const [tooltipPos,     setTooltipPos]     = useState({ x: 0, y: 0 });
  const [tooltipPixel,   setTooltipPixel]   = useState<PixelCoord | null>(null);
  const [tooltipMeta,    setTooltipMeta]    = useState<PixelMeta | null>(null);
  const pixelMetaRef = useRef<Map<string, PixelMeta>>(new Map());

  const canvasHook = useCanvas();
  const cooldown   = useCooldown();

  const {
    selectedPixel, setSelectedPixel,
    paintPixel, cursorCoord, centerPixel, zoomDisplay,
  } = canvasHook;

  const { isOnCooldown, triggerCooldown } = cooldown;
  const displayCoord = cursorCoord ?? centerPixel;

  const handleMetaUpdate = useCallback((x: number, y: number, meta: PixelMeta) => {
    pixelMetaRef.current.set(`${x},${y}`, meta);
  }, []);

  const handleRemotePixel = useCallback((x: number, y: number, color: string) => {
    paintPixel({ x, y }, color);
  }, [paintPixel]);

  const { placePixel, loadInitialPixels } = useSupabasePixels({
    username,
    onRemotePixel: handleRemotePixel,
    onMetaUpdate: handleMetaUpdate,
  });

  // Load canvas from Supabase once canvas is ready
  useEffect(() => {
    if (!canvasHook.isLoaded) return;
    loadInitialPixels((x, y, color) => paintPixel({ x, y }, color));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasHook.isLoaded]);

  // Update tooltip based on hovered pixel
  useEffect(() => {
    const pixel = canvasHook.hoverPixel;
    if (!pixel) {
      setTooltipPixel(null);
      setTooltipMeta(null);
      return;
    }
    const meta = pixelMetaRef.current.get(`${pixel.x},${pixel.y}`);
    if (meta) {
      setTooltipPixel(pixel);
      setTooltipMeta(meta);
    } else {
      setTooltipPixel(null);
      setTooltipMeta(null);
    }
  }, [canvasHook.hoverPixel]);

  // Wrap mousemove to also capture screen coords for tooltip positioning
  const handleMouseMoveWrapper = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    setTooltipPos({ x: e.clientX, y: e.clientY });
    canvasHook.handleMouseMove(e);
  }, [canvasHook]);

  const handlePlace = async () => {
    if (isOnCooldown || !selectedPixel) return;
    paintPixel(selectedPixel, activeColor);
    triggerCooldown();
    setPickerOpen(false);
    await placePixel(selectedPixel, activeColor);
  };

  const handleCancel = () => {
    setSelectedPixel(null);
    setPickerOpen(false);
  };

  useEffect(() => {
    if (selectedPixel !== null) setPickerOpen(true);
  }, [selectedPixel]);

  return (
    <div className="game-root">
      <QuantumCanvas
        canvasHook={{ ...canvasHook, handleMouseMove: handleMouseMoveWrapper }}
      />

      <HUD
        displayCoord={displayCoord}
        zoomDisplay={zoomDisplay}
        onOpenSettings={onOpenSettings}
        onOpenInfo={() => setInfoOpen(true)}
      />

      <BottomPanel
        selectedPixel={pickerOpen ? selectedPixel : null}
        activeColor={activeColor}
        onColorChange={setActiveColor}
        onPlace={handlePlace}
        onCancel={handleCancel}
        cooldown={cooldown}
        onOpenPicker={() => setPickerOpen(true)}
      />

      <InfoModal open={infoOpen} onClose={() => setInfoOpen(false)} />

      {/* Gerçek zamanlı sohbet — sol alt köşe */}
      <ChatPanel username={username} />

      {/* Piksel hover tooltip — kimin, ne zaman */}
      <PixelTooltip
        pixel={tooltipPixel}
        meta={tooltipMeta}
        screenX={tooltipPos.x}
        screenY={tooltipPos.y}
      />
    </div>
  );
}
