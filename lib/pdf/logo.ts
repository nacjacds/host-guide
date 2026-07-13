import path from "path";
import fs from "fs/promises";
import sharp from "sharp";

// public/logo.svg's visible wordmark ("Layer_2_copy") is a <text> element
// using an embedded @font-face (Montserrat-Bold as base64 woff2). Some
// libvips/librsvg builds don't resolve embedded webfonts and silently
// fall back to tofu boxes — confirmed happening on the EasyPanel
// production container while working fine locally. The file already has
// a pre-vectorized, font-free version of the same wordmark sitting in a
// hidden layer ("Layer_3", pure <path> shapes) — swap which one is
// visible before rasterizing so print output never depends on the
// server's font/SVG-text support.
function swapToVectorWordmark(svg: string): string {
  return svg
    .replace('<g id="Layer_3" class="cls-6">', '<g id="Layer_3">')
    .replace('<g id="Layer_2_copy">', '<g id="Layer_2_copy" class="cls-6">');
}

let cachedLogoDataUrl: string | null = null;

export async function getLogoDataUrl(): Promise<string> {
  if (cachedLogoDataUrl) return cachedLogoDataUrl;

  const svgPath = path.join(process.cwd(), "public", "logo.svg");
  const svg = await fs.readFile(svgPath, "utf-8");
  const buffer = await sharp(Buffer.from(swapToVectorWordmark(svg)))
    .resize({ width: 440 })
    .png()
    .toBuffer();
  cachedLogoDataUrl = `data:image/png;base64,${buffer.toString("base64")}`;
  return cachedLogoDataUrl;
}
