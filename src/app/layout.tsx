import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TopBar } from "@/components/layout/TopBar";
import { FloatingNav } from "@/components/layout/FloatingNav";
import { CustomCursor } from "@/components/cursor/CustomCursor";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ino Studio",
  description:
    "Sites web, serveurs Discord et applications sur-mesure — Ino Studio.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <CustomCursor />
        <TopBar />
        <main className="flex-1 pt-28 pb-28">{children}</main>
        <FloatingNav />
      </body>
    </html>
  );
}
