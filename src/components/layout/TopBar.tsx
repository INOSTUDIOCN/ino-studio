import { Suspense } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { LanguageSwitch } from "@/components/layout/LanguageSwitch";
import { TopBarLogo } from "@/components/layout/TopBarLogo";
import { TopBarAuthButton } from "@/components/layout/TopBarAuthButton";

export function TopBar() {
  return (
    <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-3 sm:px-4">
      <GlassPanel className="flex w-full max-w-5xl items-center justify-between gap-2 rounded-2xl px-3 py-2 sm:gap-4 sm:px-5 sm:py-3">
        <Suspense fallback={<span className="h-6 w-20 sm:h-7 sm:w-28" />}>
          <TopBarLogo />
        </Suspense>
        <div className="flex items-center gap-1.5 sm:gap-3">
          <LanguageSwitch />
          <Suspense fallback={<span className="h-8 w-20 sm:h-9 sm:w-28" />}>
            <TopBarAuthButton />
          </Suspense>
        </div>
      </GlassPanel>
    </header>
  );
}
