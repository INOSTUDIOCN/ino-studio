import { getTranslations, setRequestLocale } from "next-intl/server";
import { RevealText } from "@/components/ui/RevealText";
import { DevisForm } from "@/components/devis/DevisForm";
import { BreathingBackground } from "@/components/background/BreathingBackground";

export default async function Devis({ params }: PageProps<"/[locale]/devis">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("devis");

  return (
    <>
      <BreathingBackground variant="devis" />
      <div className="mx-auto max-w-4xl px-4 pt-16 pb-20 text-center">
        <h1 className="font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          <RevealText text={t("title")} stagger={35} />
        </h1>
        <p className="intro-rise intro-rise-2 mx-auto mt-5 max-w-xl text-balance text-ink-soft">
          {t("subtitle")}
        </p>

        <div className="intro-rise intro-rise-3 mt-14">
          <DevisForm />
        </div>
      </div>
    </>
  );
}
