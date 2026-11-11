"use client";

import { useFormStatus } from "react-dom";

/**
 * Disabled while its form is submitting, so a double click cannot create
 * two records. Shows a spinner in place of the label at the same size.
 */
export function SubmitButton({
  children,
  variant = "primary",
  className = "",
}: {
  children: React.ReactNode;
  variant?: "primary" | "danger";
  className?: string;
}) {
  const { pending } = useFormStatus();
  const tone =
    variant === "danger"
      ? "bg-white text-red-700 ring-1 ring-red-200 hover:bg-red-50"
      : "bg-ink text-white hover:bg-ink-hover";
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={`relative inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium transition disabled:cursor-wait disabled:opacity-80 ${tone} ${className}`}
    >
      <span className={pending ? "invisible" : undefined}>{children}</span>
      {pending && (
        <span
          aria-label="Working"
          className="absolute h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
        />
      )}
    </button>
  );
}
