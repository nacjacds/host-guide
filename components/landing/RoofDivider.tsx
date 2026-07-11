// A gentle rooftop-skyline silhouette — echoes the gable shape in the
// WelcoKit logo symbol, reused as the page's one recurring structural
// device instead of a plain straight section boundary.
export function RoofDivider({
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
        d="M0,64 L0,40 L240,4 L480,40 L720,8 L960,40 L1200,4 L1440,40 L1440,64 Z"
        fill={color}
      />
    </svg>
  );
}
