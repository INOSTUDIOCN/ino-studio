"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";

type ToastVariant = "success" | "error";
type ToastItem = { id: number; message: string; variant: ToastVariant; leaving: boolean };

type ToastContextValue = {
  showToast: (message: string, variant?: ToastVariant) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const DISPLAY_MS = 3200;
const EXIT_MS = 320;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const showToast = useCallback((message: string, variant: ToastVariant = "success") => {
    const id = idRef.current++;
    setToasts((prev) => [...prev, { id, message, variant, leaving: false }]);

    setTimeout(() => {
      setToasts((prev) => prev.map((toast) => (toast.id === id ? { ...toast, leaving: true } : toast)));
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, EXIT_MS);
    }, DISPLAY_MS);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-28 z-[200] flex flex-col items-center gap-2 px-4"
      >
        {toasts.map((toast) => (
          <GlassPanel
            key={toast.id}
            className={`toast-bubble pointer-events-auto rounded-2xl px-5 py-3 text-sm font-medium ${
              toast.leaving ? "toast-bubble-leave" : "toast-bubble-enter"
            } ${toast.variant === "error" ? "text-red-600" : "text-ink"}`}
          >
            {toast.message}
          </GlassPanel>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
