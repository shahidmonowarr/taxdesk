import type { FormState } from "@/lib/result";

/** Form-level message. role="alert" so screen readers announce it. */
export function FormAlert({ state }: { state: FormState }) {
  if (state.status !== "error") return null;
  return (
    <div role="alert" data-testid="form-alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
      {state.message}
    </div>
  );
}

export function fieldErrors(state: FormState): Record<string, string[] | undefined> {
  return state.status === "error" ? (state.fieldErrors ?? {}) : {};
}

export function echoed(state: FormState): Record<string, string | undefined> {
  return state.status === "error" ? (state.values ?? {}) : {};
}
