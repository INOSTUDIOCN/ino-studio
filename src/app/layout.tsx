import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { CustomCursor } from "@/components/cursor/CustomCursor";
import { LanguageTransitionProvider } from "@/components/layout/LanguageTransition";
import { LiquidGlassFilter } from "@/components/ui/LiquidGlassFilter";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const generalSans = localFont({
  variable: "--font-general-sans",
  display: "swap",
  src: [
    {
      path: "../fonts/general-sans/GeneralSans-Semibold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../fonts/general-sans/GeneralSans-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
});

export const metadata: Metadata = {
  title: "Ino Studio",
  description:
    "Ino Studio, sites web, serveurs Discord et applications sur mesure.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} ${generalSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LiquidGlassFilter />
        <LanguageTransitionProvider>
          <CustomCursor />
          {children}
        </LanguageTransitionProvider>
      </body>
    </html>
  );
}
