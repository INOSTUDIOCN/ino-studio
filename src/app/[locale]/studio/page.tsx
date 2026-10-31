import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { BreathingBackground } from "@/components/background/BreathingBackground";
import { RevealText } from "@/components/ui/RevealText";
import { RevealHero } from "@/components/ui/RevealHero";

export default async function Studio({ params }: PageProps<"/[locale]/studio">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("studio");

  const values = ["bespoke", "bilingual", "direct"] as const;

  return (
    <>
      <BreathingBackground variant="studio" />
      <div className="mx-auto max-w-3xl px-4 pt-16 text-center">
        <p className="intro-rise intro-rise-1 text-sm font-medium uppercase tracking-[0.2em] text-ink-soft">
          <span className="eyebrow-dot" aria-hidden="true" />
          <RevealText text={t("eyebrow")} />
        </p>
        <h1 className="font-display mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
          <RevealHero>
            {t.rich("title", {
              em: (chunks) => <span className="text-sheen text-emphasis">{chunks}</span>,
            })}
          </RevealHero>
        </h1>

        <div className="intro-rise intro-rise-2 mx-auto mt-8 flex max-w-xl flex-col gap-4 text-left text-ink-soft">
          <p className="leading-relaxed">{t("paragraph1")}</p>
          <p className="leading-relaxed">{t("paragraph2")}</p>
        </div>

        <div className="intro-rise intro-rise-3 mt-14 grid gap-4 sm:grid-cols-3">
          {values.map((key, i) => (
            <GlassPanel
              key={key}
              tilt
              className="relative flex flex-col gap-2 rounded-3xl p-6 text-left"
            >
              <span className="ghost-numeral">{String(i + 1).padStart(2, "0")}</span>
              <h2 className="font-display text-base font-semibold text-ink">
                {t(`values.${key}.title`)}
              </h2>
              <p className="text-sm leading-relaxed text-ink-soft">
                {t(`values.${key}.description`)}
              </p>
            </GlassPanel>
          ))}
        </div>

        <div className="intro-rise intro-rise-3 mt-16 flex flex-col items-center gap-5 pb-20">
          <p className="font-display text-xl font-semibold text-ink">
            <RevealText text={t("ctaTitle")} />
          </p>
          <Link
            href="/devis"
            className="cta-pulse rounded-full bg-ink px-7 py-3.5 font-display text-sm font-semibold text-paper transition-transform duration-200 hover:scale-[1.03]"
          >
            {t("cta")}
          </Link>
        </div>
      </div>
    </>
  );
}
