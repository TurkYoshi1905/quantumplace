import { useState, useEffect } from "react";
import { QuantumCanvas } from "../components/QuantumCanvas";
import { BottomPanel } from "../components/BottomPanel";
import { HUD } from "../components/HUD";
import { useCanvas } from "../hooks/useCanvas";
import { useCooldown } from "../hooks/useCooldown";
import type { ColorHex } from "../types";

interface GameProps {
  onOpenSettings: () => void;
}

export default function Game({ onOpenSettings }: GameProps) {
  const [activeColor,    setActiveColor]    = useState<ColorHex>("#ff4500");
  const [pickerOpen,     setPickerOpen]     = useState(false);
  const canvasHook = useCanvas();
  const cooldown   = useCooldown();

  const {
    selectedPixel, setSelectedPixel,
    paintPixel, cursorCoord, centerPixel, zoomDisplay,
  } = canvasHook;

  const { isOnCooldown, triggerCooldown } = cooldown;

  // HUD shows hovered coord if available, otherwise center of viewport
  const displayCoord = cursorCoord ?? centerPixel;

  const handlePlace = () => {
    if (isOnCooldown || !selectedPixel) return;
    paintPixel(selectedPixel, activeColor);
    triggerCooldown();
    setPickerOpen(false);
  };

  const handleCancel = () => {
    setSelectedPixel(null);
    setPickerOpen(false);
  };

  const handleOpenPicker = () => {
    setPickerOpen(true);
  };

  // Auto-open picker when user clicks a pixel on canvas
  useEffect(() => {
    if (selectedPixel !== null) setPickerOpen(true);
  }, [selectedPixel]);

  return (
    <div className="game-root">
      {/* Full-screen canvas */}
      <QuantumCanvas canvasHook={canvasHook} />

      {/* Floating HUD overlays */}
      <HUD
        displayCoord={displayCoord}
        zoomDisplay={zoomDisplay}
        onOpenSettings={onOpenSettings}
      />

      {/* Bottom CTA + slide-up color picker */}
      <BottomPanel
        selectedPixel={pickerOpen ? selectedPixel : null}
        activeColor={activeColor}
        onColorChange={setActiveColor}
        onPlace={handlePlace}
        onCancel={handleCancel}
        cooldown={cooldown}
        onOpenPicker={handleOpenPicker}
      />
    </div>
  );
}
