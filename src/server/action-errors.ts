import "server-only";
import type { FormState } from "@/lib/result";
import { AppError } from "./errors";

/** Expected errors become a message; unexpected ones are logged and hidden. */
export function toFormError(error: unknown, values: Record<string, string>): FormState {
  if (error instanceof AppError) {
    return {
      status: "error",
      message: error.message,
      fieldErrors: error.field ? { [error.field]: [error.message] } : undefined,
      values,
    };
  }
  console.error("[action] unexpected error", error);
  return { status: "error", message: "Something went wrong on our side. Please try again.", values };
}
