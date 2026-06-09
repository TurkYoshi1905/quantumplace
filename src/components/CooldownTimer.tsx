import { useI18n } from "../i18n/context";
import type { UseCooldownReturn } from "../types";

interface CooldownTimerProps {
  cooldown: UseCooldownReturn;
  inline?: boolean;
}

const RADIUS = 18;
const SW     = 2.5;
const CIRC   = 2 * Math.PI * RADIUS;
const SIZE   = 44;
const C      = SIZE / 2;

export function CooldownTimer({ cooldown, inline = false }: CooldownTimerProps) {
  const { t } = useI18n();
  const { isOnCooldown, remainingMs, progress } = cooldown;

  if (!isOnCooldown) return null;

  const dashOffset = CIRC * (1 - progress);
  const seconds    = (remainingMs / 1000).toFixed(1);

  if (inline) {
    return (
      <span className="cooldown-inline">
        <span className="cooldown-inline-text">{t("panel.cooldown")}</span>
        <span className="cooldown-inline-sec">{seconds}s</span>
      </span>
    );
  }

  return (
    <div className="cooldown-overlay">
      <div className="cooldown-ring-container">
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="cooldown-svg">
          <defs>
            <filter id="cglow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <circle cx={C} cy={C} r={RADIUS} fill="none" stroke="rgba(0,229,255,0.1)" strokeWidth={SW} />
          <circle
            cx={C} cy={C} r={RADIUS} fill="none"
            stroke="#00e5ff" strokeWidth={SW} strokeLinecap="round"
            strokeDasharray={CIRC} strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${C} ${C})`} filter="url(#cglow)"
            style={{ transition: "stroke-dashoffset 0.05s linear" }}
          />
        </svg>
        <div className="cooldown-text">
          <span className="cooldown-seconds">{seconds}</span>
          <span className="cooldown-label">s</span>
        </div>
      </div>
      <span className="cooldown-message">{t("panel.cooldown")}</span>
    </div>
  );
}
