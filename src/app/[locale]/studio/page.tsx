import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { GlassPanel } from "@/components/ui/GlassPanel";

export default async function Studio({ params }: PageProps<"/[locale]/studio">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("studio");

  const values = ["bespoke", "bilingual", "direct"] as const;

  return (
    <div className="mx-auto max-w-3xl px-4 pt-16 text-center">
      <p className="intro-rise intro-rise-1 text-sm font-medium uppercase tracking-[0.2em] text-ink-soft">
        {t("eyebrow")}
      </p>
      <h1 className="intro-rise intro-rise-1 font-display mt-4 text-4xl font-bold tracking-tight text-ink sm:text-5xl">
        {t("title")}
      </h1>

      <div className="intro-rise intro-rise-2 mx-auto mt-8 flex max-w-xl flex-col gap-4 text-left text-ink-soft">
        <p className="leading-relaxed">{t("paragraph1")}</p>
        <p className="leading-relaxed">{t("paragraph2")}</p>
      </div>

      <div className="intro-rise intro-rise-3 mt-14 grid gap-4 sm:grid-cols-3">
        {values.map((key) => (
          <GlassPanel
            key={key}
            tilt
            className="flex flex-col gap-2 rounded-3xl p-6 text-left"
          >
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
          {t("ctaTitle")}
        </p>
        <Link
          href="/devis"
          className="rounded-full bg-ink px-7 py-3.5 font-display text-sm font-semibold text-paper transition-transform duration-200 hover:scale-[1.03]"
        >
          {t("cta")}
        </Link>
      </div>
    </div>
  );
}
