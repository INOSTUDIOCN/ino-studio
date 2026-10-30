import Link from "next/link";
import { GlassPanel } from "@/components/ui/GlassPanel";

export default function Home() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <GlassPanel className="flex max-w-xl flex-col items-center gap-6 rounded-3xl px-10 py-14 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          Ino Studio
        </h1>
        <p className="text-ink-soft">
          Sites web, serveurs Discord et applications sur-mesure.
        </p>
        <Link
          href="/devis"
          className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper transition-transform duration-200 hover:scale-[1.03]"
        >
          Demander un devis
        </Link>
      </GlassPanel>
    </div>
  );
}
