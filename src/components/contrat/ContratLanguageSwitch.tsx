"use client";

import { cn } from "@/lib/cn";

const LABELS: Record<string, string> = {
  fr: "FR",
  zh: "中文",
};

export function ContratLanguageSwitch({ current }: { current: "fr" | "zh" }) {
  function handleSelect(nextLocale: string) {
    if (nextLocale === current) return;
    // eslint-disable-next-line react-hooks/immutability -- document.cookie is a browser API, not component state
    document.cookie = `INO_LOCALE=${nextLocale}; path=/; max-age=31536000`;
    window.location.reload();
  }

  return (
    <div
      role="group"
      className="relative z-20 mx-auto mt-4 flex w-fit items-center gap-0.5 rounded-full border border-ink/10 bg-paper/60 p-1 text-sm"
    >
      {Object.keys(LABELS).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => handleSelect(code)}
          aria-pressed={current === code}
          className={cn(
            "rounded-full px-3 py-1.5 font-medium transition-colors duration-200",
            current === code ? "bg-ink text-paper" : "text-ink-soft hover:text-ink"
          )}
        >
          {LABELS[code]}
        </button>
      ))}
    </div>
  );
}
