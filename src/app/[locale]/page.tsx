import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ScrollScene } from "@/components/background/ScrollScene";

export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  return (
    <>
      <ScrollScene variant="home" />
      <div className="flex min-h-[75vh] flex-col items-center justify-center px-4 text-center">
        <h1 className="intro-rise intro-rise-1 font-display max-w-3xl text-5xl font-bold tracking-tight text-ink sm:text-6xl lg:text-7xl">
          {t("tagline")}
        </h1>
        <p className="intro-rise intro-rise-2 mt-6 max-w-md text-balance text-ink-soft">
          {t("subtitle")}
        </p>
        <Link
          href="/devis"
          className="intro-rise intro-rise-3 mt-10 rounded-full bg-ink px-7 py-3.5 font-display text-sm font-semibold text-paper transition-transform duration-200 hover:scale-[1.03]"
        >
          {t("cta")}
        </Link>
      </div>
    </>
  );
}
