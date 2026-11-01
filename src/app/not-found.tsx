import Link from "next/link";

export default function RootNotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <p className="font-display text-8xl font-bold tracking-tight text-ink sm:text-9xl">404</p>
      <h1 className="font-display mt-4 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
        Cette page n&apos;existe pas.
      </h1>
      <p className="mt-3 text-ink-soft">Elle a été déplacée ou n&apos;existe plus.</p>
      <Link
        href="/fr"
        className="mt-10 rounded-full bg-ink px-9 py-4 font-display text-sm font-semibold text-paper transition-transform duration-200 hover:scale-[1.03]"
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
