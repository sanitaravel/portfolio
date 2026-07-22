import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { seoConfig } from "@/lib/seo-config";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
  fallback: [
    "ui-monospace",
    "SFMono-Regular",
    "SF Mono",
    "Menlo",
    "Consolas",
    "Liberation Mono",
    "monospace",
  ],
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(seoConfig.siteUrl),
  title: {
    default: seoConfig.defaultTitle,
    template: `%s | ${seoConfig.ownerName}`,
  },
  description: seoConfig.defaultDescription,
  authors: [{ name: seoConfig.ownerName }],
  keywords: [...seoConfig.layoutKeywords],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: seoConfig.siteName,
    images: [{
      url: seoConfig.defaultOgImage,
      width: seoConfig.ogImageDimensions.width,
      height: seoConfig.ogImageDimensions.height,
      alt: seoConfig.ownerName,
    }],
  },
  twitter: {
    card: "summary_large_image",
    creator: seoConfig.ownerTwitter,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jetbrainsMono.variable} dark h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-bg text-text font-mono overflow-x-hidden" suppressHydrationWarning>
        <Navbar />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
