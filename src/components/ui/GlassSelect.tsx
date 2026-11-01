"use client";

import { useEffect, useRef, useState } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { cn } from "@/lib/cn";

type Option = { value: string; label: string };

export function GlassSelect({
  name,
  options,
  placeholder,
  required,
  className,
}: {
  name: string;
  options: Option[];
  placeholder: string;
  required?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const selectedLabel = options.find((option) => option.value === selected)?.label;

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <input type="hidden" name={name} value={selected} required={required} />
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "flex w-full items-center justify-between rounded-2xl border border-ink/10 bg-paper/70 px-4 py-3 text-sm transition-all duration-200",
          "focus:outline-none focus-visible:border-ink/40 focus-visible:ring-2 focus-visible:ring-ink/15",
          open && "border-ink/40 ring-2 ring-ink/15",
          selected ? "text-ink" : "text-ink-soft"
        )}
      >
        <span>{selectedLabel ?? placeholder}</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
          className={cn("shrink-0 transition-transform duration-200", open && "rotate-180")}
        >
          <path
            d="M4 6l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <GlassPanel
          as="div"
          role="listbox"
          className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl p-2"
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === selected}
              onClick={() => {
                setSelected(option.value);
                setOpen(false);
              }}
              className={cn(
                "w-full rounded-xl px-3 py-2 text-left text-sm transition-colors duration-150 hover:bg-ink/5",
                option.value === selected ? "text-ink font-semibold" : "text-ink-soft"
              )}
            >
              {option.label}
            </button>
          ))}
        </GlassPanel>
      )}
    </div>
  );
}
