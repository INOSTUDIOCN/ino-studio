import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="mx-auto mt-24 flex max-w-4xl flex-col items-center gap-3 px-4 pb-6 text-center text-xs text-ink-soft">
      <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
        <Link href="/mentions-legales" className="hover:text-ink">
          {t("legalNotice")}
        </Link>
        <Link href="/confidentialite" className="hover:text-ink">
          {t("privacyPolicy")}
        </Link>
        <Link href="/cgv" className="hover:text-ink">
          {t("terms")}
        </Link>
      </nav>
      <p>{t("copyright")}</p>
    </footer>
  );
}
