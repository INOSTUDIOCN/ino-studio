"use client";

import { ActionForm } from "@/components/admin/ActionForm";
import type { ActionResult } from "@/lib/admin/action-result";

export function DeleteButton({
  action,
  label,
  confirmMessage,
  successMessage,
}: {
  action: (formData: FormData) => Promise<ActionResult>;
  label: string;
  confirmMessage: string;
  successMessage: string;
}) {
  return (
    <ActionForm action={action} successMessage={successMessage}>
      <DeleteSubmitButton confirmMessage={confirmMessage} label={label} />
    </ActionForm>
  );
}

function DeleteSubmitButton({ confirmMessage, label }: { confirmMessage: string; label: string }) {
  return (
    <button
      type="submit"
      onClick={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
      className="rounded-full border border-ink/10 bg-paper/70 px-4 py-2 text-xs font-medium text-ink-soft transition-colors duration-200 hover:text-ink"
    >
      {label}
    </button>
  );
}
