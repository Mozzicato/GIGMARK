import type { Metadata } from "next";
import { ensureSeed } from "@/lib/seed";
import { Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";

const sans = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gigmark | Proof-of-Work Identity",
  description: "Build verified economic identity from completed gigs.",
};

// Initialize database on server startup
ensureSeed();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body className="bg-white text-slate-900 font-sans antialiased">{children}</body>
    </html>
  );
}
