"use client";

import {
  createElement,
  type ComponentPropsWithoutRef,
  type ElementType,
  type ReactNode,
} from "react";
import { usePointerTilt } from "@/lib/usePointerTilt";

type GlassPanelTiltProps<T extends ElementType> = {
  as: T;
  className?: string;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className" | "children">;

export function GlassPanelTilt<T extends ElementType>({
  as,
  className,
  children,
  ...props
}: GlassPanelTiltProps<T>) {
  const ref = usePointerTilt<HTMLElement>();

  return createElement(
    as,
    { ref, className: `${className ?? ""} glass-panel--tilt`, ...props },
    children
  );
}
