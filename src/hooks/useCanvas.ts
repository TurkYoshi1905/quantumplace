import { useCallback, useEffect, useRef, useState } from "react";
import type { PixelCoord, Transform, UseCanvasReturn } from "../types";
import { useIndexedDB } from "./useIndexedDB";

const CANVAS_SIZE  = 2048;
const MIN_SCALE    = 0.04;
const MAX_SCALE    = 5;   // 5x max zoom

function hexToRgb(hex: string): [number, number, number] {
  const c = hex.replace("#", "");
  return [parseInt(c.slice(0,2),16), parseInt(c.slice(2,4),16), parseInt(c.slice(4,6),16)];
}

function createDefaultPixelData(): Uint8ClampedArray {
  const d = new Uint8ClampedArray(CANVAS_SIZE * CANVAS_SIZE * 4);
  for (let i = 0; i < d.length; i += 4) { d[i]=255; d[i+1]=255; d[i+2]=255; d[i+3]=255; }
  return d;
}

function clamp(v: number, lo: number, hi: number) { return Math.min(hi, Math.max(lo, v)); }

function formatZoom(scale: number): string {
  if (scale >= 10) return `${Math.round(scale)}x`;
  if (scale >= 1)  return `${scale.toFixed(1)}x`;
  return `${scale.toFixed(2)}x`;
}

function computeCenterPixel(t: Transform, cw: number, ch: number): PixelCoord {
  return {
    x: clamp(Math.floor((cw / 2 - t.x) / t.scale), 0, CANVAS_SIZE - 1),
    y: clamp(Math.floor((ch / 2 - t.y) / t.scale), 0, CANVAS_SIZE - 1),
  };
}

export function useCanvas(): UseCanvasReturn {
  const canvasElRef   = useRef<HTMLCanvasElement | null>(null);
  const offscreenRef  = useRef<HTMLCanvasElement | null>(null);
  const pixelDataRef  = useRef<Uint8ClampedArray>(createDefaultPixelData());
  const transformRef  = useRef<Transform>({ x: 0, y: 0, scale: 1 });
  const rafRef        = useRef<number>(0);
  const saveTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDraggingRef = useRef(false);
  const didDragRef    = useRef(false);
  const dragStartRef  = useRef({ x: 0, y: 0 });
  const lastPosRef    = useRef({ x: 0, y: 0 });
  const lastDistRef   = useRef(0);
  const hoverRef      = useRef<PixelCoord | null>(null);
  const selectedRef   = useRef<PixelCoord | null>(null);
  const isLoadedRef   = useRef(false);

  const [transform,     setTransform]     = useState<Transform>({ x: 0, y: 0, scale: 1 });
  const [hoverPixel,    setHoverPixel]    = useState<PixelCoord | null>(null);
  const [selectedPixel, setSelectedPixel] = useState<PixelCoord | null>(null);
  const [cursorCoord,   setCursorCoord]   = useState<PixelCoord | null>(null);
  const [centerPixel,   setCenterPixel]   = useState<PixelCoord>({ x: 1024, y: 1024 });
  const [isLoaded,      setIsLoaded]      = useState(false);
  const [zoomDisplay,   setZoomDisplay]   = useState("1x");
  const [zoomPercent,   setZoomPercent]   = useState(100);

  const { loadPixelData, savePixelData, isReady } = useIndexedDB();

  const isInBounds = (p: PixelCoord) => p.x >= 0 && p.x < CANVAS_SIZE && p.y >= 0 && p.y < CANVAS_SIZE;

  const screenToCanvas = (sx: number, sy: number): PixelCoord => {
    const t = transformRef.current;
    return { x: Math.floor((sx - t.x) / t.scale), y: Math.floor((sy - t.y) / t.scale) };
  };

  const applyTransform = useCallback((newT: Transform) => {
    newT.scale = clamp(newT.scale, MIN_SCALE, MAX_SCALE);
    transformRef.current = newT;
    setTransform({ ...newT });
    setZoomDisplay(formatZoom(newT.scale));
    setZoomPercent(Math.round(newT.scale * 100));
    const canvas = canvasElRef.current;
    if (canvas) {
      setCenterPixel(computeCenterPixel(newT, canvas.width, canvas.height));
    }
  }, []);

  const setSelectedBoth = useCallback((p: PixelCoord | null) => {
    selectedRef.current = p;
    setSelectedPixel(p);
  }, []);

  // ── Offscreen canvas ──────────────────────────────────────────────────────
  useEffect(() => {
    const off = document.createElement("canvas");
    off.width = CANVAS_SIZE; off.height = CANVAS_SIZE;
    offscreenRef.current = off;
  }, []);

  // ── RAF render loop — runs once, reads refs ───────────────────────────────
  useEffect(() => {
    const loop = () => {
      const canvas = canvasElRef.current;
      const off    = offscreenRef.current;
      if (canvas && off && isLoadedRef.current) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const t = transformRef.current;
          const w = canvas.width;
          const h = canvas.height;

          ctx.clearRect(0, 0, w, h);

          ctx.save();
          ctx.imageSmoothingEnabled = false;
          ctx.translate(t.x, t.y);
          ctx.scale(t.scale, t.scale);

          // ── Canvas white fill ──
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

          // ── Draw pixel art ──
          ctx.drawImage(off, 0, 0);

          // ── Macro-grid: every 128 game-px (visible even at 0.35x zoom) ──
          // At 0.35x: 128 × 0.35 = 44.8 CSS px between lines → clearly visible
          // Fades out smoothly as pixel-grid takes over at scale >= 2
          const CHUNK = 128;
          const macroAlpha = Math.max(0, Math.min(0.14, 0.14 - (t.scale - 0.3) * 0.07));
          if (macroAlpha > 0.005) {
            ctx.strokeStyle = `rgba(100,100,100,${macroAlpha})`;
            ctx.lineWidth   = 1 / t.scale;
            for (let x = 0; x <= CANVAS_SIZE; x += CHUNK) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,CANVAS_SIZE); ctx.stroke(); }
            for (let y = 0; y <= CANVAS_SIZE; y += CHUNK) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(CANVAS_SIZE,y); ctx.stroke(); }
          }

          // ── Pixel grid — fades in at scale >= 2 ──
          if (t.scale >= 2) {
            const alpha = Math.min(0.25, 0.06 + 0.04 * (t.scale - 2));
            ctx.strokeStyle = `rgba(180,180,180,${alpha})`;
            ctx.lineWidth   = 1 / t.scale;
            const x0 = Math.max(0, Math.floor(-t.x / t.scale));
            const y0 = Math.max(0, Math.floor(-t.y / t.scale));
            const x1 = Math.min(CANVAS_SIZE, Math.ceil((w - t.x) / t.scale));
            const y1 = Math.min(CANVAS_SIZE, Math.ceil((h - t.y) / t.scale));
            for (let x = x0; x <= x1; x++) { ctx.beginPath(); ctx.moveTo(x,y0); ctx.lineTo(x,y1); ctx.stroke(); }
            for (let y = y0; y <= y1; y++) { ctx.beginPath(); ctx.moveTo(x0,y); ctx.lineTo(x1,y); ctx.stroke(); }
          }

          // ── Canvas border ──
          ctx.strokeStyle = "rgba(0,0,0,0.2)";
          ctx.lineWidth   = 2 / t.scale;
          ctx.strokeRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

          // ── Selected pixel highlight ──
          const sp = selectedRef.current;
          if (sp && isInBounds(sp)) {
            ctx.fillStyle = "rgba(0,180,255,0.25)";
            ctx.fillRect(sp.x, sp.y, 1, 1);
          }

          ctx.restore(); // back to screen space

          // ── Crosshair (corner brackets) — drawn in screen space ──
          const hp = hoverRef.current;
          if (hp && isInBounds(hp)) {
            const sx = hp.x * t.scale + t.x;
            const sy = hp.y * t.scale + t.y;
            const ps = Math.max(4, t.scale); // pixel screen size (min 4px for visibility)
            const cl = Math.max(4, Math.min(ps * 0.45, 16)); // corner length

            ctx.strokeStyle = "rgba(50, 50, 50, 0.9)";
            ctx.lineWidth = 1.5;
            ctx.lineCap = "square";

            // Top-left
            ctx.beginPath(); ctx.moveTo(sx, sy + cl); ctx.lineTo(sx, sy); ctx.lineTo(sx + cl, sy); ctx.stroke();
            // Top-right
            ctx.beginPath(); ctx.moveTo(sx + ps - cl, sy); ctx.lineTo(sx + ps, sy); ctx.lineTo(sx + ps, sy + cl); ctx.stroke();
            // Bottom-left
            ctx.beginPath(); ctx.moveTo(sx, sy + ps - cl); ctx.lineTo(sx, sy + ps); ctx.lineTo(sx + cl, sy + ps); ctx.stroke();
            // Bottom-right
            ctx.beginPath(); ctx.moveTo(sx + ps - cl, sy + ps); ctx.lineTo(sx + ps, sy + ps); ctx.lineTo(sx + ps, sy + ps - cl); ctx.stroke();
          }
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []); // intentionally empty — refs only

  // ── Canvas resize ─────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasElRef.current;
    if (!canvas) return;
    const resize = () => {
      canvas.width  = canvas.offsetWidth  || window.innerWidth;
      canvas.height = canvas.offsetHeight || window.innerHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [isLoaded]);

  // ── Load pixel data from IndexedDB ────────────────────────────────────────
  useEffect(() => {
    if (!isReady || !offscreenRef.current) return;
    const off = offscreenRef.current;
    const ctx = off.getContext("2d");
    if (!ctx) return;

    loadPixelData().then((stored) => {
      const data = stored ?? createDefaultPixelData();
      pixelDataRef.current = data;
      ctx.putImageData(new ImageData(new Uint8ClampedArray(data), CANVAS_SIZE, CANVAS_SIZE), 0, 0);
      isLoadedRef.current = true;
      setIsLoaded(true);

      // Initial zoom: fit whole canvas to screen (r/place "Resim 1" standard)
      const cw = canvasElRef.current?.offsetWidth  || window.innerWidth;
      const ch = canvasElRef.current?.offsetHeight || window.innerHeight;
      const scale = clamp(Math.min(cw / CANVAS_SIZE, ch / CANVAS_SIZE), MIN_SCALE, MAX_SCALE);
      const t: Transform = {
        scale,
        x: (cw - CANVAS_SIZE * scale) / 2,
        y: (ch - CANVAS_SIZE * scale) / 2,
      };
      applyTransform(t);

      // Handle URL params (?x=&y=)
      const params = new URLSearchParams(window.location.search);
      const px = params.get("x"); const py = params.get("y");
      if (px && py) {
        const ix = parseInt(px, 10); const iy = parseInt(py, 10);
        if (!isNaN(ix) && !isNaN(iy)) {
          setTimeout(() => {
            const scale2 = MAX_SCALE * 0.6;
            applyTransform({ scale: scale2, x: cw/2 - ix*scale2, y: ch/2 - iy*scale2 });
            setSelectedBoth({ x: ix, y: iy });
          }, 100);
        }
      }
    }).catch(console.error);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady]);

  // ── Native event listeners (wheel + touch) ────────────────────────────────
  useEffect(() => {
    const canvas = canvasElRef.current;
    if (!canvas) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect   = canvas.getBoundingClientRect();
      const mx     = e.clientX - rect.left;
      const my     = e.clientY - rect.top;
      const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
      const t      = transformRef.current;
      const ns     = clamp(t.scale * factor, MIN_SCALE, MAX_SCALE);
      const r      = ns / t.scale;
      applyTransform({ scale: ns, x: mx - (mx - t.x) * r, y: my - (my - t.y) * r });
    };

    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      didDragRef.current = false;
      if (e.touches.length === 1) {
        lastPosRef.current   = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        const dx = e.touches[1].clientX - e.touches[0].clientX;
        const dy = e.touches[1].clientY - e.touches[0].clientY;
        lastDistRef.current = Math.hypot(dx, dy);
        didDragRef.current  = true;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length === 1) {
        const t0  = e.touches[0];
        const dx  = t0.clientX - lastPosRef.current.x;
        const dy  = t0.clientY - lastPosRef.current.y;
        if (Math.abs(t0.clientX - dragStartRef.current.x) > 4 ||
            Math.abs(t0.clientY - dragStartRef.current.y) > 4) didDragRef.current = true;
        const tr = transformRef.current;
        applyTransform({ ...tr, x: tr.x + dx, y: tr.y + dy });
        lastPosRef.current = { x: t0.clientX, y: t0.clientY };
      } else if (e.touches.length === 2) {
        const dx   = e.touches[1].clientX - e.touches[0].clientX;
        const dy   = e.touches[1].clientY - e.touches[0].clientY;
        const dist = Math.hypot(dx, dy);
        const factor = dist / (lastDistRef.current || dist);
        lastDistRef.current = dist;
        const mx   = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const my   = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        const rect = canvas.getBoundingClientRect();
        const sx   = mx - rect.left; const sy = my - rect.top;
        const tr   = transformRef.current;
        const ns   = clamp(tr.scale * factor, MIN_SCALE, MAX_SCALE);
        const r    = ns / tr.scale;
        applyTransform({ scale: ns, x: sx - (sx - tr.x) * r, y: sy - (sy - tr.y) * r });
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      if (e.changedTouches.length === 1 && !didDragRef.current && e.touches.length === 0) {
        const t    = e.changedTouches[0];
        const rect = canvas.getBoundingClientRect();
        const cp   = screenToCanvas(t.clientX - rect.left, t.clientY - rect.top);
        if (isInBounds(cp)) setSelectedBoth(cp);
      }
    };

    canvas.addEventListener("wheel",      onWheel,      { passive: false });
    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    canvas.addEventListener("touchmove",  onTouchMove,  { passive: false });
    canvas.addEventListener("touchend",   onTouchEnd,   { passive: false });
    return () => {
      canvas.removeEventListener("wheel",      onWheel);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove",  onTouchMove);
      canvas.removeEventListener("touchend",   onTouchEnd);
    };
  }, [isLoaded, applyTransform, setSelectedBoth]);

  // ── Paint pixel ───────────────────────────────────────────────────────────
  const scheduleDBSave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => savePixelData(pixelDataRef.current).catch(console.error), 600);
  }, [savePixelData]);

  const paintPixel = useCallback((coord: PixelCoord, color: string) => {
    if (!isInBounds(coord)) return;
    const off = offscreenRef.current;
    if (!off) return;
    const ctx = off.getContext("2d");
    if (!ctx) return;
    const [r, g, b] = hexToRgb(color);
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(coord.x, coord.y, 1, 1);
    const idx = (coord.y * CANVAS_SIZE + coord.x) * 4;
    pixelDataRef.current[idx]   = r;
    pixelDataRef.current[idx+1] = g;
    pixelDataRef.current[idx+2] = b;
    pixelDataRef.current[idx+3] = 255;
    scheduleDBSave();
  }, [scheduleDBSave]);

  // ── Zoom helpers ──────────────────────────────────────────────────────────
  const zoomAt = useCallback((factor: number) => {
    const canvas = canvasElRef.current;
    if (!canvas) return;
    const cx = canvas.width / 2; const cy = canvas.height / 2;
    const t  = transformRef.current;
    const ns = clamp(t.scale * factor, MIN_SCALE, MAX_SCALE);
    const r  = ns / t.scale;
    applyTransform({ scale: ns, x: cx - (cx - t.x) * r, y: cy - (cy - t.y) * r });
  }, [applyTransform]);

  const zoomIn  = useCallback(() => zoomAt(1.5), [zoomAt]);
  const zoomOut = useCallback(() => zoomAt(1 / 1.5), [zoomAt]);

  const jumpTo = useCallback((x: number, y: number) => {
    const cw = canvasElRef.current?.width  || window.innerWidth;
    const ch = canvasElRef.current?.height || window.innerHeight;
    const scale = MAX_SCALE * 0.6;
    applyTransform({ scale, x: cw/2 - x*scale, y: ch/2 - y*scale });
    setSelectedBoth({ x, y });
  }, [applyTransform, setSelectedBoth]);

  // ── Mouse handlers ────────────────────────────────────────────────────────
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return;
    isDraggingRef.current = true;
    didDragRef.current    = false;
    lastPosRef.current    = { x: e.clientX, y: e.clientY };
    dragStartRef.current  = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasElRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cp   = screenToCanvas(e.clientX - rect.left, e.clientY - rect.top);
    const inB  = isInBounds(cp);
    setCursorCoord(inB ? cp : null);
    hoverRef.current = inB ? cp : null;
    setHoverPixel(inB ? cp : null);

    if (isDraggingRef.current) {
      const dx = e.clientX - lastPosRef.current.x;
      const dy = e.clientY - lastPosRef.current.y;
      if (Math.abs(e.clientX - dragStartRef.current.x) > 3 ||
          Math.abs(e.clientY - dragStartRef.current.y) > 3) didDragRef.current = true;
      const tr = transformRef.current;
      applyTransform({ ...tr, x: tr.x + dx, y: tr.y + dy });
      lastPosRef.current = { x: e.clientX, y: e.clientY };
    }
  }, [applyTransform]);

  const handleMouseUp    = useCallback(() => { isDraggingRef.current = false; }, []);
  const handleMouseLeave = useCallback(() => {
    isDraggingRef.current = false;
    hoverRef.current = null;
    setHoverPixel(null);
    setCursorCoord(null);
  }, []);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (didDragRef.current) return;
    const canvas = canvasElRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cp   = screenToCanvas(e.clientX - rect.left, e.clientY - rect.top);
    if (isInBounds(cp)) setSelectedBoth(cp);
  }, [setSelectedBoth]);

  const canvasRef = useCallback((el: HTMLCanvasElement | null) => {
    canvasElRef.current = el;
  }, []);

  return {
    canvasRef, transform, hoverPixel, selectedPixel, cursorCoord, centerPixel,
    paintPixel, handleMouseDown, handleMouseMove, handleMouseUp,
    handleMouseLeave, handleClick, isLoaded, zoomDisplay, zoomPercent,
    setSelectedPixel: setSelectedBoth,
    jumpTo, zoomIn, zoomOut,
  };
}
