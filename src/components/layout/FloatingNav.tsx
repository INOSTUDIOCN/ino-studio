import Link from "next/link";
import { GlassPanel } from "@/components/ui/GlassPanel";

const LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/devis", label: "Devis" },
  { href: "/espace-client", label: "Espace client" },
];

export function FloatingNav() {
  return (
    <nav
      aria-label="Navigation principale"
      className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4"
    >
      <GlassPanel className="flex items-center gap-1 rounded-full px-2 py-2">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-full px-4 py-2 text-sm font-medium text-ink-soft transition-colors duration-200 hover:bg-ink/5 hover:text-ink"
          >
            {link.label}
          </Link>
        ))}
      </GlassPanel>
    </nav>
  );
}
