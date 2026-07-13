import path from "path";
import sharp from "sharp";

// The web logo is an SVG with an embedded custom-font wordmark (see
// public/logo.svg) — @react-pdf/renderer's <Image> can't render SVG, so it's
// rasterized once per process and cached, rather than re-run per request.
let cachedLogoDataUrl: string | null = null;

export async function getLogoDataUrl(): Promise<string> {
  if (cachedLogoDataUrl) return cachedLogoDataUrl;

  const svgPath = path.join(process.cwd(), "public", "logo.svg");
  const buffer = await sharp(svgPath).resize({ width: 440 }).png().toBuffer();
  cachedLogoDataUrl = `data:image/png;base64,${buffer.toString("base64")}`;
  return cachedLogoDataUrl;
}
