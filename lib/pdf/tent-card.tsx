import path from "path";
import { Document, Page, View, Text, Image, Font, StyleSheet } from "@react-pdf/renderer";

// @react-pdf/renderer runs its own layout/font engine (fontkit) server-side —
// it can't reuse next/font/google, so the same brand fonts used on the web
// (see .claude/skills/welcokit-brand) are self-hosted here as static .woff
// files and registered once per process.
let fontsRegistered = false;
function registerFonts() {
  if (fontsRegistered) return;
  const fontsDir = path.join(process.cwd(), "public", "fonts");
  Font.register({
    family: "Inter",
    fonts: [
      { src: path.join(fontsDir, "Inter-Regular.woff"), fontWeight: 400 },
      { src: path.join(fontsDir, "Inter-SemiBold.woff"), fontWeight: 600 },
      { src: path.join(fontsDir, "Inter-Bold.woff"), fontWeight: 700 },
    ],
  });
  Font.register({
    family: "Playfair Display",
    fonts: [{ src: path.join(fontsDir, "PlayfairDisplay-Bold.woff"), fontWeight: 700 }],
  });
  fontsRegistered = true;
}

// A4 in points (72dpi): 595.28 x 841.89. The physical fold crease sits at
// the exact vertical center of the sheet (420.945pt) no matter what we draw
// — so the fold-hint strip is centered on that midpoint, and each panel gets
// half the remaining height. Panels are close enough to A5 (210 x 148.5mm)
// that a host who'd rather not fold can just cut along the strip instead.
const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const FOLD_STRIP_HEIGHT = 14;
const PANEL_HEIGHT = (PAGE_HEIGHT - FOLD_STRIP_HEIGHT) / 2;

const COLORS = {
  navy: "#1B4F72",
  orange: "#FF4200",
  text: "#1A1A18",
  textSecondary: "#6B6B67",
  border: "#DDD8CC",
  cream: "#FAFAF8",
};

// The scan instruction is short enough to show in both languages at once —
// simpler and more useful for guests than guessing/detecting one. The fold
// hint stays single-language (tied to the property's language) since it's
// host-facing, not guest-facing.
const SCAN_TEXT_ES = "Escanea para ver la guía de tu alojamiento";
const SCAN_TEXT_EN = "Scan to view your stay guide";

const copy = {
  es: { fold: "dobla aquí" },
  en: { fold: "fold here" },
} as const;

// Long property names would otherwise overflow or wrap awkwardly next to the
// QR — step the font size down instead of letting it wrap more than 2 lines.
function nameFontSize(name: string): number {
  if (name.length > 34) return 20;
  if (name.length > 22) return 25;
  return 32;
}

const styles = StyleSheet.create({
  page: {
    padding: 0,
  },
  panel: {
    width: PAGE_WIDTH,
    height: PANEL_HEIGHT,
    paddingVertical: 28,
    paddingHorizontal: 36,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.cream,
  },
  logo: {
    width: 110,
  },
  textBlock: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
  },
  propertyName: {
    fontFamily: "Playfair Display",
    fontWeight: 700,
    color: COLORS.navy,
    textAlign: "center",
  },
  scanBlock: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 1,
  },
  scanText: {
    fontFamily: "Inter",
    fontWeight: 500,
    fontSize: 10.5,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  qrBlock: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
  },
  qrImage: {
    width: 140,
    height: 140,
  },
  urlText: {
    fontFamily: "Inter",
    fontWeight: 400,
    fontSize: 8,
    color: COLORS.textSecondary,
  },
  dots: {
    display: "flex",
    flexDirection: "row",
    gap: 5,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: COLORS.orange,
  },
  foldStrip: {
    width: PAGE_WIDTH,
    height: FOLD_STRIP_HEIGHT,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.cream,
  },
  foldLabel: {
    fontFamily: "Inter",
    fontWeight: 400,
    fontSize: 7,
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
});

interface PanelProps {
  propertyName: string;
  guideUrl: string;
  language: "es" | "en";
  qrDataUrl: string;
  logoDataUrl: string;
}

function Panel({ propertyName, guideUrl, qrDataUrl, logoDataUrl }: PanelProps) {
  const displayUrl = guideUrl.replace(/^https?:\/\//, "");

  return (
    <View style={styles.panel}>
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <Image src={logoDataUrl} style={styles.logo} />

      <View style={styles.textBlock}>
        <Text style={[styles.propertyName, { fontSize: nameFontSize(propertyName) }]}>
          {propertyName}
        </Text>
        <View style={styles.scanBlock}>
          <Text style={styles.scanText}>{SCAN_TEXT_ES}</Text>
          <Text style={styles.scanText}>{SCAN_TEXT_EN}</Text>
        </View>
      </View>

      <View style={styles.qrBlock}>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image src={qrDataUrl} style={styles.qrImage} />
        <Text style={styles.urlText}>{displayUrl}</Text>
      </View>

      <View style={styles.dots}>
        {[0, 1, 2, 3, 4].map((i) => (
          <View key={i} style={styles.dot} />
        ))}
      </View>
    </View>
  );
}

export interface TentCardProps {
  propertyName: string;
  guideUrl: string;
  language: "es" | "en";
  qrDataUrl: string;
  logoDataUrl: string;
}

export function TentCardDocument({
  propertyName,
  guideUrl,
  language,
  qrDataUrl,
  logoDataUrl,
}: TentCardProps) {
  registerFonts();
  const t = copy[language];
  const panelProps = { propertyName, guideUrl, language, qrDataUrl, logoDataUrl };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Panel {...panelProps} />

        <View style={styles.foldStrip}>
          <Text style={styles.foldLabel}>· · · · · · {t.fold} · · · · · ·</Text>
        </View>

        {/* Bottom half rotated 180° around its own center: when the sheet is
            folded along the dashed line with the crease at the top, both
            halves lean outward like a roof and read right-side-up from
            either side of a table. */}
        <View style={{ transform: "rotate(180deg)", transformOrigin: "center" }}>
          <Panel {...panelProps} />
        </View>
      </Page>
    </Document>
  );
}
