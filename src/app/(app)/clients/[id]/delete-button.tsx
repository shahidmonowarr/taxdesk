"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { idle, type FormState } from "@/lib/result";

export function DeleteClientButton({ action, name }: { action: () => Promise<FormState>; name: string }) {
  const [state, formAction] = useActionState(action, idle);
  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!window.confirm(`Delete ${name}? This cannot be undone.`)) e.preventDefault();
      }}
      className="flex flex-col items-end gap-1"
    >
      <SubmitButton variant="danger">Delete</SubmitButton>
      {state.status === "error" && <p role="alert" className="text-sm text-red-700">{state.message}</p>}
    </form>
  );
}
