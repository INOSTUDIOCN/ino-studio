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
    </div>
  );
}
