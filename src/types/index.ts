export interface Transform {
  x: number;
  y: number;
  scale: number;
}

export interface PixelCoord {
  x: number;
  y: number;
}

export interface UseCanvasReturn {
  canvasRef: (el: HTMLCanvasElement | null) => void;
  transform: Transform;
  hoverPixel: PixelCoord | null;
  selectedPixel: PixelCoord | null;
  cursorCoord: PixelCoord | null;
  centerPixel: PixelCoord;
  paintPixel: (coord: PixelCoord, color: string) => void;
  handleMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  handleMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  handleMouseUp: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  handleMouseLeave: () => void;
  handleClick: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  isLoaded: boolean;
  zoomDisplay: string;
  zoomPercent: number;
  setSelectedPixel: (p: PixelCoord | null) => void;
  jumpTo: (x: number, y: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
}

export interface UseIndexedDBReturn {
  loadPixelData: () => Promise<Uint8ClampedArray | null>;
  savePixelData: (data: Uint8ClampedArray) => Promise<void>;
  isReady: boolean;
}

export interface UseCooldownReturn {
  isOnCooldown: boolean;
  remainingMs: number;
  progress: number;
  triggerCooldown: () => void;
}

export type ColorHex = string;
