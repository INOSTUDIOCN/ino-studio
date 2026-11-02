import { getTranslations, setRequestLocale } from "next-intl/server";
import { RevealText } from "@/components/ui/RevealText";
import { ResetPasswordForm } from "@/components/connexion/ResetPasswordForm";
import { BreathingBackground } from "@/components/background/BreathingBackground";

export default async function ReinitialiserMotDePasse({
  params,
}: PageProps<"/[locale]/reinitialiser-mot-de-passe">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("resetPassword");

  return (
    <>
      <BreathingBackground variant="home" />
      <div className="mx-auto max-w-4xl px-4 pt-16 pb-20 text-center">
        <h1 className="relative z-20 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          <RevealText text={t("title")} stagger={35} />
        </h1>
        <p className="intro-rise intro-rise-2 relative z-20 mx-auto mt-5 max-w-xl text-balance text-ink-soft">
          {t("subtitle")}
        </p>
        <div className="intro-rise intro-rise-3 mt-14">
          <ResetPasswordForm />
        </div>
      </div>
    </>
  );
}
