import Link from "next/link";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { LiquidGlassBackground } from "@/components/background/LiquidGlassBackground";

export default function Home() {
  return (
    <>
      <LiquidGlassBackground />
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <GlassPanel
          tilt
          className="flex max-w-xl flex-col items-center gap-6 rounded-3xl px-10 py-14 text-center"
        >
          <h1 className="intro-rise intro-rise-1 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            Ino Studio
          </h1>
          <p className="intro-rise intro-rise-2 text-ink-soft">
            Sites web, serveurs Discord et applications sur-mesure.
          </p>
          <Link
            href="/devis"
            className="intro-rise intro-rise-3 rounded-full bg-ink px-6 py-3 font-display text-sm font-semibold text-paper transition-transform duration-200 hover:scale-[1.03]"
          >
            Demander un devis
          </Link>
        </GlassPanel>
      </div>
    </>
  );
}
