import QRCode from "qrcode";

export async function generateGuideQrCode(slug: string): Promise<string> {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/guide/${slug}`;
  return QRCode.toDataURL(url, {
    width: 512,
    margin: 2,
    color: { dark: "#000000", light: "#ffffff" },
  });
}
