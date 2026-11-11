import { z } from "zod";

/** The single shape every server action returns to a form. */
export type FormState<TValues = Record<string, string>> =
  | { status: "idle" }
  | { status: "success"; message: string }
  | {
      status: "error";
      message: string;
      fieldErrors?: Partial<Record<keyof TValues & string, string[]>>;
      /** Echoed back so the form keeps what the user typed after an error. */
      values?: Partial<TValues>;
    };

export const idle: FormState = { status: "idle" };

export function validationError<T>(
  error: z.ZodError<T>,
  values: Record<string, string>,
): FormState {
  return {
    status: "error",
    message: "Please fix the highlighted fields.",
    fieldErrors: z.flattenError(error).fieldErrors as Record<string, string[]>,
    values,
  };
}

/** Plain string values of a form, for echoing back. Passwords are dropped. */
export function formValues(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string" && !key.startsWith("$") && !/password/i.test(key)) {
      values[key] = value;
    }
  }
  return values;
}
