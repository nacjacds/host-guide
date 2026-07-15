// Duotone icon set for the "Para reservas desde cualquier plataforma" step
// sequence — same #FF4200/#1A1A18 duotone treatment as FeatureIcons.tsx,
// but unframed: all three read as either a single bold silhouette
// (booking, share arrow) or a multi-part literal object (phone with its
// own mini tile grid), neither of which gets the ring-with-ticks frame
// under that same single-emblem-vs-composition criterion.
const STROKE = "#1A1A18";
const FILL = "#FF4200";

export function BookingConfirmedIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 96 96" fill="none" aria-hidden="true" className={className}>
      <path d="M21,24 H75 A8,8 0 0 1 83,32 V44 H13 V32 A8,8 0 0 1 21,24 Z" fill={FILL} />
      <rect x="13" y="24" width="70" height="56" rx="8" fill="none" stroke={STROKE} strokeWidth="4" />
      <line x1="32" y1="14" x2="32" y2="28" stroke={STROKE} strokeWidth="4" strokeLinecap="round" />
      <line x1="64" y1="14" x2="64" y2="28" stroke={STROKE} strokeWidth="4" strokeLinecap="round" />
      <path
        d="M34,64 l10,8 l18,-20"
        fill="none"
        stroke={FILL}
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Provided as a final, ready-made asset (not built from the shared
// STROKE/FILL constants above) — keeps its own non-square viewBox exactly
// as authored rather than being redrawn to match the other two.
export function SendLinkIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 23.4" fill="none" aria-hidden="true" className={className}>
      <path
        d="M30.3,12c.1,0,.2-.2.2-.4s0-.3-.2-.4L19.8,2.5c-.1-.1-.4-.2-.5,0-.2,0-.3.3-.3.5v4.8C6.9,7.9,1.5,20.1,1.5,20.1c0,.2,0,.5.2.6.2.1.4.1.6,0,6.2-5.4,14.7-5.3,16.7-5.2v4.8c0,.2.1.4.3.5.2,0,.4,0,.5,0l10.5-8.8Z"
        fill={FILL}
        fillRule="evenodd"
        stroke="#000"
        strokeWidth="1.5"
        strokeMiterlimit="10"
      />
    </svg>
  );
}

export function PhoneAccessIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 96 96" fill="none" aria-hidden="true" className={className}>
      <rect x="30" y="14" width="36" height="68" rx="8" fill="none" stroke={STROKE} strokeWidth="3.5" />
      <line x1="40" y1="76" x2="56" y2="76" stroke={STROKE} strokeWidth="2.5" strokeLinecap="round" />
      <rect x="36" y="24" width="10" height="10" rx="2" fill="none" stroke={STROKE} strokeWidth="2" />
      <circle cx="41" cy="29" r="2" fill={FILL} />
      <rect x="50" y="24" width="10" height="10" rx="2" fill="none" stroke={STROKE} strokeWidth="2" />
      <path
        d="M52,31 l3,-4 l3,4"
        stroke={FILL}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="36" y="38" width="10" height="10" rx="2" fill="none" stroke={STROKE} strokeWidth="2" />
      <circle cx="41" cy="43" r="2.2" fill={FILL} />
      <rect x="50" y="38" width="10" height="10" rx="2" fill="none" stroke={STROKE} strokeWidth="2" />
      <path d="M53,44 h4" stroke={FILL} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
