"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { useLanguageTransition } from "@/components/layout/LanguageTransition";
import { cn } from "@/lib/cn";

const LABELS: Record<string, string> = {
  fr: "FR",
  zh: "中文",
};

export function LanguageSwitch() {
  const locale = useLocale();
  const t = useTranslations("topbar");
  const pathname = usePathname();
  const router = useRouter();
  const { cover, reveal } = useLanguageTransition();

  async function handleSelect(nextLocale: string, event: React.MouseEvent) {
    if (nextLocale === locale) return;
    const origin = { x: event.clientX, y: event.clientY };
    await cover(origin);
    router.replace({ pathname }, { locale: nextLocale });
    await new Promise((resolve) => setTimeout(resolve, 560));
    await reveal();
  }

  return (
    <div
      role="group"
      aria-label={t("languageSwitchAria")}
      className="flex items-center gap-0.5 rounded-full border border-ink/10 bg-paper/60 p-1 text-xs sm:text-sm"
    >
      {routing.locales.map((code) => (
        <button
          key={code}
          type="button"
          onClick={(event) => handleSelect(code, event)}
          aria-pressed={locale === code}
          className={cn(
            "whitespace-nowrap rounded-full px-2 py-1 font-medium transition-colors duration-200 sm:px-3 sm:py-1.5",
            locale === code
              ? "bg-ink text-paper"
              : "text-ink-soft hover:text-ink"
          )}
        >
          {LABELS[code] ?? code}
        </button>
      ))}
    </div>
  );
}
