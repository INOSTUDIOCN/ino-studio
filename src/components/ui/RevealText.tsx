"use client";

import { useRevealOnView } from "@/lib/useRevealOnView";
import { cn } from "@/lib/cn";

type RevealTextProps<T extends keyof React.JSX.IntrinsicElements> = {
  text: string;
  as?: T;
  className?: string;
  wordClassName?: string;
  stagger?: number;
};

export function RevealText<T extends keyof React.JSX.IntrinsicElements = "span">({
  text,
  as,
  className,
  wordClassName,
  stagger = 45,
}: RevealTextProps<T>) {
  const Tag = (as ?? "span") as React.ElementType;
  const { ref, visible } = useRevealOnView<HTMLElement>();
  const words = text.split(" ");

  return (
    <Tag ref={ref} className={className}>
      {words.map((word, i) => (
        <span key={i} className="reveal-word-mask">
          <span
            className={cn("reveal-word", visible && "reveal-word--visible", wordClassName)}
            style={{ transitionDelay: `${i * stagger}ms` }}
          >
            {word}
            {i < words.length - 1 ? " " : ""}
          </span>
        </span>
      ))}
    </Tag>
  );
}
