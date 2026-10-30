import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

type GlassPanelProps<T extends ElementType> = {
  as?: T;
  className?: string;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className" | "children">;

export function GlassPanel<T extends ElementType = "div">({
  as,
  className,
  children,
  ...props
}: GlassPanelProps<T>) {
  const Component = as ?? "div";

  return (
    <Component className={cn("glass-panel", className)} {...props}>
      {children}
    </Component>
  );
}
