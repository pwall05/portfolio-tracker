import type { Metadata, Viewport } from "next";

import AppChrome from "@/components/mobile/AppChrome";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portfolio",
  applicationName: "Portfolio",
  description: "Read-only mobile portfolio rollup from Paul's Obsidian vault.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Portfolio",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/icons/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0d0f",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#0b0d0f] font-sans text-white antialiased">
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}
