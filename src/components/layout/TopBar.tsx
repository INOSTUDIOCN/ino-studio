import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { LanguageSwitch } from "@/components/layout/LanguageSwitch";

export function TopBar() {
  const t = useTranslations("topbar");

  return (
    <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <GlassPanel className="flex w-full max-w-5xl items-center justify-between gap-4 rounded-2xl px-5 py-3">
        <Link href="/" aria-label={t("homeAria")} className="flex items-center">
          <Image
            src="/logo.png"
            alt="Ino Studio"
            width={490}
            height={125}
            priority
            className="h-7 w-auto"
          />
        </Link>
        <div className="flex items-center gap-3">
          <LanguageSwitch />
          <Link
            href="/connexion"
            className="rounded-full border border-ink/10 bg-paper/70 px-4 py-2 text-sm font-medium text-ink transition-colors duration-200 hover:bg-paper"
          >
            {t("login")}
          </Link>
        </div>
      </GlassPanel>
    </header>
  );
}
