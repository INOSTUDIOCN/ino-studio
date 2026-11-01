import { Suspense } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { LanguageSwitch } from "@/components/layout/LanguageSwitch";
import { TopBarLogo } from "@/components/layout/TopBarLogo";
import { TopBarAuthButton } from "@/components/layout/TopBarAuthButton";

export function TopBar() {
  return (
    <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <GlassPanel className="flex w-full max-w-5xl items-center justify-between gap-4 rounded-2xl px-5 py-3">
        <Suspense fallback={<span className="h-7 w-28" />}>
          <TopBarLogo />
        </Suspense>
        <div className="flex items-center gap-3">
          <LanguageSwitch />
          <Suspense fallback={<span className="h-9 w-28" />}>
            <TopBarAuthButton />
          </Suspense>
        </div>
      </GlassPanel>
    </header>
  );
}
