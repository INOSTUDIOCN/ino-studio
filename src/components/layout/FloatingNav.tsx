import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { FloatingNavLinks } from "@/components/layout/FloatingNavLinks";

export function FloatingNav() {
  const t = useTranslations("nav");

  return (
    <nav
      aria-label={t("ariaLabel")}
      className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4"
    >
      <GlassPanel className="flex items-center gap-1 rounded-full px-2 py-2">
        <Suspense fallback={null}>
          <FloatingNavLinks />
        </Suspense>
      </GlassPanel>
    </nav>
  );
}
