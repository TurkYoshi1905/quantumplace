import { useState, useEffect } from "react";
import { QuantumCanvas } from "../components/QuantumCanvas";
import { BottomPanel } from "../components/BottomPanel";
import { HUD } from "../components/HUD";
import { InfoModal } from "../components/InfoModal";
import { useCanvas } from "../hooks/useCanvas";
import { useCooldown } from "../hooks/useCooldown";
import type { ColorHex } from "../types";

interface GameProps {
  onOpenSettings: () => void;
}

export default function Game({ onOpenSettings }: GameProps) {
  const [activeColor,    setActiveColor]    = useState<ColorHex>("#ff4500");
  const [pickerOpen,     setPickerOpen]     = useState(false);
  const [infoOpen,       setInfoOpen]       = useState(false);
  const canvasHook = useCanvas();
  const cooldown   = useCooldown();

  const {
    selectedPixel, setSelectedPixel,
    paintPixel, cursorCoord, centerPixel, zoomDisplay,
  } = canvasHook;

  const { isOnCooldown, triggerCooldown } = cooldown;

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

  useEffect(() => {
    if (selectedPixel !== null) setPickerOpen(true);
  }, [selectedPixel]);

  return (
    <div className="game-root">
      <QuantumCanvas canvasHook={canvasHook} />

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
        onOpenPicker={handleOpenPicker}
      />

      <InfoModal open={infoOpen} onClose={() => setInfoOpen(false)} />
    </div>
  );
}
