// Duotone feature-card icon set — dark structural stroke (#1A1A18) +
// brand-orange fill (#FF4200) for the emphasis shape, adapted from a
// reference astrology icon pack's treatment (not its subject matter).
// Two icons (house, pin+spark) reduce to a single "emblem" glyph and get
// the ring-with-ticks frame; the other two (bubbles, QR+paper) are
// two-part/literal-object compositions whose own silhouette is the
// icon, so they stay unframed — same split the reference pack itself
// uses. Fixed hex colors, not currentColor: this is a deliberate
// two-color illustration set, not a tintable single-stroke icon.
const STROKE = "#1A1A18";
const FILL = "#FF4200";

function TickRing() {
  return (
    <>
      <circle cx="48" cy="48" r="41" stroke={STROKE} strokeWidth="3" />
      <g stroke={STROKE} strokeWidth="3.5" strokeLinecap="round">
        <line x1="48" y1="11" x2="48" y2="3" />
        <line x1="74.2" y1="21.8" x2="79.8" y2="16.2" />
        <line x1="85" y1="48" x2="93" y2="48" />
        <line x1="74.2" y1="74.2" x2="79.8" y2="79.8" />
        <line x1="48" y1="85" x2="48" y2="93" />
        <line x1="21.8" y1="74.2" x2="16.2" y2="79.8" />
        <line x1="11" y1="48" x2="3" y2="48" />
        <line x1="21.8" y1="21.8" x2="16.2" y2="16.2" />
      </g>
    </>
  );
}

export function HouseGuideIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 96 96" fill="none" aria-hidden="true" className={className}>
      <TickRing />
      <path
        d="M30,50 L48,30 L66,50 Z"
        fill={FILL}
        stroke={STROKE}
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <rect x="34" y="50" width="28" height="22" fill="none" stroke={STROKE} strokeWidth="3.5" />
      <path
        d="M42,58 L54,58 L54,72 L48,68 L42,72 Z"
        fill={FILL}
        stroke={STROKE}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TranslationIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 96 96" fill="none" aria-hidden="true" className={className}>
      <path
        d="M16,30 h32 a8,8 0 0 1 8,8 v14 a8,8 0 0 1 -8,8 h-18 l-8,10 v-10 h-6 a8,8 0 0 1 -8,-8 v-14 a8,8 0 0 1 8,-8 Z"
        fill="none"
        stroke={STROKE}
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path
        d="M48,18 h30 a8,8 0 0 1 8,8 v14 a8,8 0 0 1 -8,8 h-6 v10 l-9,-10 h-15 a8,8 0 0 1 -8,-8 v-14 a8,8 0 0 1 8,-8 Z"
        fill={FILL}
        stroke={STROKE}
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <g stroke={STROKE} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M40,37 h10 M47,34 l3,3 l-3,3" />
        <path d="M56,45 h-10 M49,48 l-3,-3 l3,-3" />
      </g>
    </svg>
  );
}

export function AiPinIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 96 96" fill="none" aria-hidden="true" className={className}>
      <TickRing />
      <path
        d="M48,68 C48,68 32,52 32,38 A16,16 0 1,1 64,38 C64,52 48,68 48,68 Z"
        fill={FILL}
        stroke={STROKE}
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <circle cx="48" cy="38" r="6" fill="#FAFAF8" stroke={STROKE} strokeWidth="2.5" />
      <path
        d="M70,18 L72.5,24.5 L79,27 L72.5,29.5 L70,36 L67.5,29.5 L61,27 L67.5,24.5 Z"
        fill={FILL}
      />
    </svg>
  );
}

export function PrintableQrIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 96 96" fill="none" aria-hidden="true" className={className}>
      <rect x="22" y="14" width="52" height="68" rx="6" fill="none" stroke={STROKE} strokeWidth="3.5" />
      <path
        d="M60,14 L74,14 L74,28 Z"
        fill="#FAFAF8"
        stroke={STROKE}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <rect x="32" y="24" width="13" height="13" fill="none" stroke={STROKE} strokeWidth="2.5" />
      <rect x="35.5" y="27.5" width="6" height="6" fill={FILL} />
      <rect x="53" y="24" width="13" height="13" fill="none" stroke={STROKE} strokeWidth="2.5" />
      <rect x="56.5" y="27.5" width="6" height="6" fill={FILL} />
      <rect x="32" y="45" width="13" height="13" fill="none" stroke={STROKE} strokeWidth="2.5" />
      <rect x="35.5" y="48.5" width="6" height="6" fill={FILL} />
      <g fill={STROKE}>
        <rect x="50" y="45" width="5" height="5" />
        <rect x="58" y="45" width="5" height="5" />
        <rect x="50" y="53" width="5" height="5" />
        <rect x="58" y="53" width="5" height="5" />
      </g>
      <g stroke={STROKE} strokeWidth="2" strokeLinecap="round">
        <line x1="32" y1="68" x2="52" y2="68" />
        <line x1="32" y1="73" x2="44" y2="73" />
      </g>
      <line x1="30" y1="79" x2="66" y2="79" stroke={STROKE} strokeWidth="1.5" strokeDasharray="3,3" />
    </svg>
  );
}
