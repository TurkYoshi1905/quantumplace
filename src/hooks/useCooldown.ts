import { useCallback, useEffect, useRef, useState } from "react";
import type { UseCooldownReturn } from "../types";

const COOLDOWN_MS = 1000;

export function useCooldown(): UseCooldownReturn {
  const [isOnCooldown, setIsOnCooldown] = useState(false);
  const [remainingMs, setRemainingMs] = useState(0);
  const endTimeRef = useRef<number>(0);
  const rafRef = useRef<number>(0);

  const tick = useCallback(() => {
    const now = performance.now();
    const remaining = endTimeRef.current - now;
    if (remaining <= 0) {
      setIsOnCooldown(false);
      setRemainingMs(0);
      return;
    }
    setRemainingMs(remaining);
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const triggerCooldown = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    endTimeRef.current = performance.now() + COOLDOWN_MS;
    setIsOnCooldown(true);
    setRemainingMs(COOLDOWN_MS);
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const progress = isOnCooldown ? remainingMs / COOLDOWN_MS : 0;

  return { isOnCooldown, remainingMs, progress, triggerCooldown };
}
