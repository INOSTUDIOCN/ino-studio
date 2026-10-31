import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { TopBar } from "@/components/layout/TopBar";
import { FloatingNav } from "@/components/layout/FloatingNav";
import { HtmlLangSync } from "@/components/layout/HtmlLangSync";

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
    <NextIntlClientProvider messages={messages}>
      <HtmlLangSync locale={locale} />
      <TopBar />
      <main className="flex-1 pt-28 pb-28">{children}</main>
      <FloatingNav />
    </NextIntlClientProvider>
  );
}
