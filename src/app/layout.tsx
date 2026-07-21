import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

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
  title: "Developer Portfolio",
  description: "Personal portfolio of a junior full-stack developer",
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
      </body>
    </html>
  );
}
