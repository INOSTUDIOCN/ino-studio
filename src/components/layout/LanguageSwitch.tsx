"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

const LANGUAGES = [
  { code: "fr", label: "FR" },
  { code: "zh", label: "中文" },
] as const;

type LanguageCode = (typeof LANGUAGES)[number]["code"];

export function LanguageSwitch() {
  const [active, setActive] = useState<LanguageCode>("fr");

  return (
    <div
      role="group"
      aria-label="Changer de langue"
      className="flex items-center gap-0.5 rounded-full border border-ink/10 bg-paper/60 p-1 text-sm"
    >
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          type="button"
          onClick={() => setActive(lang.code)}
          aria-pressed={active === lang.code}
          className={cn(
            "rounded-full px-3 py-1.5 font-medium transition-colors duration-200",
            active === lang.code
              ? "bg-ink text-paper"
              : "text-ink-soft hover:text-ink"
          )}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
