import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { routing } from "@/i18n/routing";
import { TopBar } from "@/components/layout/TopBar";
import { FloatingNav } from "@/components/layout/FloatingNav";
import { CustomCursor } from "@/components/cursor/CustomCursor";
import { LanguageTransitionProvider } from "@/components/layout/LanguageTransition";
import "../globals.css";

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
      path: "../../fonts/general-sans/GeneralSans-Semibold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../fonts/general-sans/GeneralSans-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
});

export const metadata: Metadata = {
  title: "Ino Studio",
  description:
    "Sites web, serveurs Discord et applications sur-mesure — Ino Studio.",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} ${generalSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider messages={messages}>
          <LanguageTransitionProvider>
            <CustomCursor />
            <TopBar />
            <main className="flex-1 pt-28 pb-28">{children}</main>
            <FloatingNav />
          </LanguageTransitionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
