import type { BlockImage } from "@/types";

function Figure({ image }: { image: BlockImage }) {
  return (
    <figure>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.url}
        alt={image.alt}
        loading="lazy"
        className="h-auto w-full rounded-lg"
      />
      {image.caption && (
        <figcaption className="mt-1 text-center text-xs text-muted-foreground">
          {image.caption}
        </figcaption>
      )}
    </figure>
  );
}

export function BlockImageCarousel({ images }: { images: BlockImage[] }) {
  if (images.length === 0) return null;

  if (images.length === 1) {
    return <Figure image={images[0]} />;
  }

  return (
    <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2">
      {images.map((image, i) => (
        <div key={i} className="w-full shrink-0 snap-center">
          <Figure image={image} />
        </div>
      ))}
    </div>
  );
}
