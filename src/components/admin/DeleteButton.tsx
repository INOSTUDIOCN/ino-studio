"use client";

export function DeleteButton({
  action,
  label,
  confirmMessage,
}: {
  action: () => Promise<void>;
  label: string;
  confirmMessage: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="rounded-full border border-ink/10 bg-paper/70 px-4 py-2 text-xs font-medium text-ink-soft transition-colors duration-200 hover:text-ink"
      >
        {label}
      </button>
    </form>
  );
}
