import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";

// Force clean rebuild (no cached Docker layers): 2026-07-09 22:58 UTC

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "WelcoKit — Todo lo que tus huéspedes necesitan saber, en un solo lugar",
  description:
    "Crea guías digitales inteligentes para tus huéspedes. Con IA, multiidioma, QR WiFi y más.",
  openGraph: {
    title: "WelcoKit",
    description: "Todo lo que tus huéspedes necesitan saber, en un solo lugar",
    url: "https://welcokit.com",
    siteName: "WelcoKit",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "WelcoKit",
    description: "Todo lo que tus huéspedes necesitan saber, en un solo lugar",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={cn("scroll-smooth font-sans", inter.variable, playfairDisplay.variable)}
    >
      <body className="antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
