import QRCode from "qrcode";
import { getAppUrl } from "@/lib/env";

export function getGuideUrl(slug: string): string {
  return `${getAppUrl()}/guide/${slug}`;
}

export async function generateGuideQrCode(slug: string): Promise<string> {
  return QRCode.toDataURL(getGuideUrl(slug), {
    width: 512,
    margin: 2,
    color: { dark: "#000000", light: "#ffffff" },
  });
}

export async function generateGuideQrCodeBuffer(slug: string): Promise<Buffer> {
  return QRCode.toBuffer(getGuideUrl(slug), {
    width: 512,
    margin: 2,
    color: { dark: "#000000", light: "#ffffff" },
  });
}

// Higher resolution than the on-screen QR (lib/qr.ts's 512px) so it stays
// crisp printed at physical sizes larger than a phone screen.
export async function generatePrintQrCodeDataUrl(slug: string): Promise<string> {
  return QRCode.toDataURL(getGuideUrl(slug), {
    width: 1000,
    margin: 2,
    color: { dark: "#000000", light: "#ffffff" },
  });
}
