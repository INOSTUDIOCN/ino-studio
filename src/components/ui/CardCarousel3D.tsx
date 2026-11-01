import type { ReactNode } from "react";

export function CardCarousel3D({
  children,
  cycleSeconds = 15,
}: {
  children: ReactNode[];
  cycleSeconds?: number;
}) {
  const count = children.length;

  return (
    <div className="card-carousel-stage">
      {children.map((child, i) => (
        <div
          key={i}
          className="card-carousel-card"
          style={{
            animationDuration: `${cycleSeconds}s`,
            animationDelay: `${-(i * cycleSeconds) / count}s`,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
