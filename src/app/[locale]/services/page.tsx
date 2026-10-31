import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { GlassPanel } from "@/components/ui/GlassPanel";

export default async function Services({ params }: PageProps<"/[locale]/services">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("services");

  const items = ["web", "discord", "apps"] as const;

  return (
    <div className="mx-auto max-w-4xl px-4 pt-16 text-center">
      <p className="intro-rise intro-rise-1 text-sm font-medium uppercase tracking-[0.2em] text-ink-soft">
        {t("eyebrow")}
      </p>
      <h1 className="intro-rise intro-rise-1 font-display mt-4 text-4xl font-bold tracking-tight text-ink sm:text-5xl">
        {t("title")}
      </h1>
      <p className="intro-rise intro-rise-2 mx-auto mt-5 max-w-xl text-balance text-ink-soft">
        {t("subtitle")}
      </p>

      <div className="intro-rise intro-rise-3 mt-14 grid gap-4 text-left sm:grid-cols-3">
        {items.map((key) => (
          <GlassPanel
            key={key}
            tilt
            className="flex flex-col gap-3 rounded-3xl p-7"
          >
            <h2 className="font-display text-lg font-semibold text-ink">
              {t(`items.${key}.title`)}
            </h2>
            <p className="text-sm leading-relaxed text-ink-soft">
              {t(`items.${key}.description`)}
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
