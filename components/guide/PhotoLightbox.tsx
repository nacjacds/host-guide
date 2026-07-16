"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGuideLocale } from "./GuideLocaleProvider";

const SWIPE_THRESHOLD_PX = 50;

export function PhotoLightbox({
  images,
  initialIndex,
  onClose,
}: {
  images: string[];
  initialIndex: number;
  onClose: () => void;
}) {
  const { t } = useGuideLocale();
  const [index, setIndex] = useState(initialIndex);
  const touchStartX = useRef<number | null>(null);
  const hasMultiple = images.length > 1;

  function goPrev() {
    setIndex((i) => (i - 1 + images.length) % images.length);
  }
  function goNext() {
    setIndex((i) => (i + 1) % images.length);
  }

  // Locks background scroll while open and wires Escape/arrow-key
  // navigation — this is a plain fixed overlay (not a Radix/Base UI
  // dialog), so there's no built-in focus trap or key handling to lean on.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
    }
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (deltaX > SWIPE_THRESHOLD_PX) goPrev();
    else if (deltaX < -SWIPE_THRESHOLD_PX) goNext();
    touchStartX.current = null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-100 flex animate-in items-center justify-center bg-black/90 p-4 fade-in duration-150"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label={t("photoClose")}
        className="absolute top-4 right-4 z-10 flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
      >
        <X size={22} strokeWidth={1.75} />
      </button>

      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            aria-label={t("photoPrevious")}
            className="absolute top-1/2 left-2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-4"
          >
            <ChevronLeft size={26} strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            aria-label={t("photoNext")}
            className="absolute top-1/2 right-2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-4"
          >
            <ChevronRight size={26} strokeWidth={1.75} />
          </button>
        </>
      )}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={images[index]}
        alt=""
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] max-w-full animate-in rounded-lg object-contain zoom-in-95 duration-150"
      />

      {hasMultiple && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
        >
          <p className="text-sm font-medium text-white/90">
            {index + 1} / {images.length}
          </p>
          <div className="flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`${i + 1}`}
                className={cn(
                  "size-1.5 rounded-full transition-colors",
                  i === index ? "bg-white" : "bg-white/40"
                )}
              />
            ))}
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
