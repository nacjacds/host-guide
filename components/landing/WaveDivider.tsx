// A gentle wave silhouette used as the page's one recurring structural
// device between sections, instead of a plain straight section boundary.
export function WaveDivider({
  color,
  flip = false,
  className = "",
}: {
  color: string;
  flip?: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 1440 64"
      preserveAspectRatio="none"
      className={`block h-12 w-full sm:h-16 ${flip ? "rotate-180" : ""} ${className}`}
      aria-hidden="true"
    >
      <path
        d="M0,32 C240,64 480,0 720,32 C960,64 1200,0 1440,32 L1440,64 L0,64 Z"
        fill={color}
      />
    </svg>
  );
}
