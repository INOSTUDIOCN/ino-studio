import {
  createElement,
  type ComponentPropsWithoutRef,
  type ElementType,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";
import { GlassPanelTilt } from "@/components/ui/GlassPanelTilt";

type GlassPanelProps<T extends ElementType> = {
  as?: T;
  className?: string;
  children?: ReactNode;
  tilt?: boolean;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className" | "children">;

export function GlassPanel<T extends ElementType = "div">({
  as,
  className,
  children,
  tilt = false,
  ...props
}: GlassPanelProps<T>) {
  const Component = as ?? "div";
  const panelClassName = cn("glass-panel", className);

  if (tilt) {
    return createElement(
      GlassPanelTilt,
      { as: Component, className: panelClassName, ...props },
      children
    );
  }

  return createElement(Component, { className: panelClassName, ...props }, children);
}
