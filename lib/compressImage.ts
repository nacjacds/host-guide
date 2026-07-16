import imageCompression from "browser-image-compression";

export interface CompressImageOptions {
  maxSizeMB: number;
  maxWidthOrHeight?: number;
}

async function getImageDimensions(file: File): Promise<{ width: number; height: number } | null> {
  try {
    const bitmap = await createImageBitmap(file);
    const dimensions = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return dimensions;
  } catch {
    return null;
  }
}

// Compresses/resizes an image client-side before upload — run at every
// upload point in the app (cover image, block images, avatar, support
// screenshots) so a Retina screenshot or an out-of-camera photo never
// travels over the network at its original weight, and storage never
// holds it uncompressed either.
//
// Skips compression entirely when the file already fits both budgets —
// re-encoding a file that doesn't need it would only risk a visible
// quality loss (and, for PNGs, silently converting them to JPEG) for no
// size benefit. `maxWidthOrHeight` isn't passed for callers that don't
// care about resolution (e.g. the avatar, cropped to 200x200 server-side
// anyway) — defaults to 1920, plenty for any surface in the guide.
export async function compressImageFile(
  file: File,
  { maxSizeMB, maxWidthOrHeight = 1920 }: CompressImageOptions
): Promise<File> {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (file.size <= maxSizeBytes) {
    const dimensions = await getImageDimensions(file);
    if (dimensions && dimensions.width <= maxWidthOrHeight && dimensions.height <= maxWidthOrHeight) {
      return file;
    }
  }

  try {
    return await imageCompression(file, {
      maxSizeMB,
      maxWidthOrHeight,
      useWebWorker: true,
      initialQuality: 0.85,
    });
  } catch (err) {
    // Compression failing (corrupt image, worker unavailable, etc.) isn't
    // fatal on its own — fall back to the original file and let the
    // caller's own post-compression size check decide whether it's still
    // acceptable, same as the "still too large" path.
    console.error("Image compression failed, using original file:", err);
    return file;
  }
}
