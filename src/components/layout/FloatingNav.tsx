import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { ClientSpaceLink } from "@/components/layout/ClientSpaceLink";

export function FloatingNav() {
  const t = useTranslations("nav");

  const links = [
    { href: "/", label: t("home") },
    { href: "/services", label: t("services") },
    { href: "/devis", label: t("quote") },
  ];

  return (
    <nav
      aria-label={t("ariaLabel")}
      className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4"
    >
      <GlassPanel className="flex items-center gap-1 rounded-full px-2 py-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-full px-4 py-2 text-sm font-medium text-ink-soft transition-colors duration-200 hover:bg-ink/5 hover:text-ink"
          >
            {link.label}
          </Link>
        ))}
        <Suspense fallback={null}>
          <ClientSpaceLink />
        </Suspense>
      </GlassPanel>
    </nav>
  );
}
