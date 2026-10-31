import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { BreathingBackground } from "@/components/background/BreathingBackground";
import { RevealHero } from "@/components/ui/RevealHero";

export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const tTopbar = await getTranslations("topbar");

  return (
    <>
      <BreathingBackground variant="home" />
      <div className="flex min-h-[75vh] flex-col items-center justify-center px-4 text-center">
        <h1 className="font-display max-w-3xl text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
          <RevealHero>
            {t.rich("tagline", {
              em: (chunks) => <span className="text-sheen text-emphasis">{chunks}</span>,
            })}
          </RevealHero>
        </h1>
        <p className="intro-rise intro-rise-2 mt-6 max-w-md text-balance text-ink-soft">
          {t("subtitle")}
        </p>
        <Link
          href="/connexion"
          className="cta-liquid cta-pulse intro-rise intro-rise-3 mt-10 bg-ink px-9 py-4 font-display text-sm font-semibold text-paper transition-transform duration-200 hover:scale-[1.03]"
        >
          {tTopbar("login")}
        </Link>
      </div>
    </>
  );
}
