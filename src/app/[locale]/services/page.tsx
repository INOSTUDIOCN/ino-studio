import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { BreathingBackground } from "@/components/background/BreathingBackground";
import { RevealText } from "@/components/ui/RevealText";
import { CardCarousel3D } from "@/components/ui/CardCarousel3D";
import { BrandIcon, type BrandIconName } from "@/components/ui/BrandIcon";

const ITEMS: Array<{ key: "web" | "discord" | "apps"; icons: BrandIconName[] }> = [
  { key: "web", icons: ["chrome", "firefox"] },
  { key: "discord", icons: ["discord"] },
  { key: "apps", icons: ["apple", "android"] },
];

export default async function Services({ params }: PageProps<"/[locale]/services">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("services");

  return (
    <>
      <BreathingBackground variant="services" />
      <div className="mx-auto max-w-4xl px-4 pt-16 pb-20 text-center">
        <h1 className="font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          <RevealText text={t("title")} stagger={35} />
        </h1>

        <div className="intro-rise intro-rise-3 mt-16 w-full">
          <CardCarousel3D>
            {ITEMS.map(({ key, icons }, i) => (
              <GlassPanel
                key={key}
                tilt
                className="relative flex h-full flex-col items-center justify-center gap-4 rounded-3xl p-8 text-center"
              >
                <span className="ghost-numeral">{String(i + 1).padStart(2, "0")}</span>
                <div className="flex items-center gap-4 text-ink">
                  {icons.map((icon) => (
                    <BrandIcon key={icon} name={icon} className="h-8 w-8" />
                  ))}
                </div>
                <h2 className="font-display text-lg font-semibold text-ink">
                  {t(`items.${key}.title`)}
                </h2>
              </GlassPanel>
            ))}
          </CardCarousel3D>
        </div>

        <span className="cta-scan intro-rise intro-rise-3 mt-16">
          <Link
            href="/devis"
            className="cta-scan-inner px-9 py-4 font-display text-sm font-semibold text-paper transition-transform duration-200 hover:scale-[1.03]"
          >
            {t("cta")}
          </Link>
        </span>
      </div>
    </>
  );
}
