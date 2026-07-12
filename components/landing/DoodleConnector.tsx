"use client";

import { useEffect, useState, type RefObject } from "react";

interface DoodleConnectorProps {
  // Shared positioned ancestor both endpoints live inside — the SVG's
  // coordinate space is relative to this element, not the viewport.
  containerRef: RefObject<HTMLElement>;
  originRef: RefObject<HTMLElement>;
  targetRef: RefObject<HTMLElement>;
  color?: string;
}

// Draws a dashed, hand-drawn-looking curve between two elements, computed
// from their real on-screen positions (not hardcoded coordinates) so it
// keeps connecting correctly across content/font changes and viewport
// resizes. Desktop-only — see LandingHero.tsx for why this is skipped
// below the lg breakpoint.
export function DoodleConnector({
  containerRef,
  originRef,
  targetRef,
  color = "#C0603A",
}: DoodleConnectorProps) {
  const [path, setPath] = useState<string | null>(null);
  const [box, setBox] = useState({ width: 0, height: 0 });

  useEffect(() => {
    function recalc() {
      const container = containerRef.current;
      const origin = originRef.current;
      const target = targetRef.current;
      if (!container || !origin || !target) return;

      const containerRect = container.getBoundingClientRect();
      const originRect = origin.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();

      const start = {
        x: originRect.left + originRect.width / 2 - containerRect.left,
        y: originRect.top + originRect.height / 2 - containerRect.top,
      };
      // Approach from directly above the button, dropping into the narrow
      // margin between the paragraph and the button row — paired with the
      // mid-point below, this keeps the whole stroke either in the empty
      // gutter between the two columns or in that margin gap, instead of
      // crossing over the paragraph text or the "see how it works" link.
      const end = {
        x: targetRect.left + targetRect.width / 2 - containerRect.left,
        y: targetRect.top - containerRect.top,
      };
      const dy = end.y - start.y;
      const dx = end.x - start.x;

      // Stay near the origin's x for most of the descent (the gutter
      // between the text and card columns), then sweep left into the
      // button only right at the end — two short cubic segments instead
      // of one long one so the "sweep" reads as a deliberate flick, not a
      // straight ruler-line or a generic tutorial arrow.
      const mid = { x: start.x + dx * 0.15, y: start.y + dy * 0.88 };
      const c1a = { x: start.x - 15, y: start.y + dy * 0.25 };
      const c1b = { x: mid.x + 20, y: start.y + dy * 0.65 };
      const c2a = { x: mid.x - 40, y: mid.y + dy * 0.03 };
      const c2b = { x: end.x + 60, y: end.y - dy * 0.05 };

      setBox({ width: containerRect.width, height: containerRect.height });
      setPath(
        `M${start.x},${start.y} C${c1a.x},${c1a.y} ${c1b.x},${c1b.y} ${mid.x},${mid.y} C${c2a.x},${c2a.y} ${c2b.x},${c2b.y} ${end.x},${end.y}`
      );
    }

    recalc();
    window.addEventListener("resize", recalc);
    const ro = new ResizeObserver(recalc);
    if (containerRef.current) ro.observe(containerRef.current);

    return () => {
      window.removeEventListener("resize", recalc);
      ro.disconnect();
    };
  }, [containerRef, originRef, targetRef]);

  if (!path) return null;

  return (
    <svg
      className="pointer-events-none absolute inset-0 hidden lg:block"
      width={box.width}
      height={box.height}
      aria-hidden="true"
    >
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeDasharray="3 3"
        strokeLinecap="round"
      />
    </svg>
  );
}
