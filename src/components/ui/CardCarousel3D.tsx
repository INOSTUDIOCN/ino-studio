"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type Slot = "center" | "right" | "left";

function slotFor(index: number, active: number, count: number): Slot {
  const diff = (index - active + count) % count;
  if (diff === 0) return "center";
  if (diff === 1) return "right";
  return "left";
}

export function CardCarousel3D({ children }: { children: ReactNode[] }) {
  const [active, setActive] = useState(0);
  const count = children.length;

  function goPrev() {
    setActive((current) => (current - 1 + count) % count);
  }

  function goNext() {
    setActive((current) => (current + 1) % count);
  }

  return (
    <div>
      <div className="card-carousel-stage">
        {children.map((child, i) => {
          const slot = slotFor(i, active, count);
          const clickable = slot !== "center";

          return (
            <div
              key={i}
              className={cn("card-carousel-card", `card-carousel-card--${slot}`)}
              role={clickable ? "button" : undefined}
              tabIndex={clickable ? 0 : undefined}
              aria-label={clickable ? `Voir la carte ${i + 1}` : undefined}
              onClick={clickable ? () => setActive(i) : undefined}
              onKeyDown={
                clickable
                  ? (event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setActive(i);
                      }
                    }
                  : undefined
              }
            >
              {child}
            </div>
          );
        })}
      </div>

      <div className="card-carousel-controls">
        <button
          type="button"
          className="card-carousel-arrow"
          aria-label="Carte précédente"
          onClick={goPrev}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M10 3L5 8L10 13"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div className="card-carousel-dots">
          {children.map((_, i) => (
            <button
              key={i}
              type="button"
              className={cn("card-carousel-dot", i === active && "card-carousel-dot--active")}
              aria-label={`Afficher la carte ${i + 1}`}
              aria-current={i === active}
              onClick={() => setActive(i)}
            />
          ))}
        </div>

        <button
          type="button"
          className="card-carousel-arrow"
          aria-label="Carte suivante"
          onClick={goNext}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M6 3L11 8L6 13"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
