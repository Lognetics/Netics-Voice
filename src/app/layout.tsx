import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NETICS Voice - The AI Employee That Never Misses a Customer",
  description:
    "NETICS Voice is a multi-tenant AI Customer Operations Platform that automates phone calls, bookings, orders and support across every industry.",
  keywords: [
    "AI voice agent",
    "customer operations",
    "AI call center",
    "voice AI",
    "booking automation",
  ],
};

export const viewport: Viewport = {
  themeColor: "#080B14",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable} dark`}>
      <body className="min-h-screen bg-base-bg text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
