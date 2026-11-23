"use client";

import { useActionState, useEffect, useRef, type ReactNode } from "react";
import { useToast } from "@/components/admin/ToastProvider";
import type { ActionResult } from "@/lib/admin/action-result";

const initialState: ActionResult = { status: "idle" };

export function ActionForm({
  action,
  successMessage,
  className,
  children,
}: {
  action: (formData: FormData) => Promise<ActionResult>;
  successMessage: string;
  className?: string;
  children: ReactNode;
}) {
  const { showToast } = useToast();
  const lastHandled = useRef<ActionResult>(initialState);

  async function handle(_prevState: ActionResult, formData: FormData): Promise<ActionResult> {
    return action(formData);
  }

  const [state, formAction] = useActionState(handle, initialState);

  useEffect(() => {
    if (state === lastHandled.current) return;
    lastHandled.current = state;
    if (state.status === "success") {
      showToast(state.message ?? successMessage, "success");
    } else if (state.status === "error") {
      showToast(state.message, "error");
    }
  }, [state, successMessage, showToast]);

  return (
    <form action={formAction} className={className}>
      {children}
    </form>
  );
}
