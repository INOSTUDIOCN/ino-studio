import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { BreathingBackground } from "@/components/background/BreathingBackground";

export default async function NotFound() {
  const locale = await getLocale();
  setRequestLocale(locale);
  const t = await getTranslations("notFound");

  return (
    <>
      <BreathingBackground variant="home" />
      <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 text-center">
        <p className="intro-rise intro-rise-1 text-sheen font-display text-8xl font-bold tracking-tight sm:text-9xl">
          404
        </p>
        <h1 className="intro-rise intro-rise-2 font-display mt-4 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          {t("title")}
        </h1>
        <p className="intro-rise intro-rise-3 mt-3 text-ink-soft">{t("subtitle")}</p>

        <span className="cta-scan intro-rise intro-rise-3 mt-10">
          <Link
            href="/"
            className="cta-scan-inner px-9 py-4 font-display text-sm font-semibold text-paper transition-transform duration-200 hover:scale-[1.03]"
          >
            {t("cta")}
          </Link>
        </span>
      </div>
    </>
  );
}
