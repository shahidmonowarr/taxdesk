/**
 * Expected, user-facing failures. Services throw these; the action layer turns
 * them into a friendly message. Anything else is a bug and is logged, never
 * shown to the user.
 */
export class AppError extends Error {
  constructor(
    message: string,
    readonly code: "NOT_FOUND" | "CONFLICT" | "UNAUTHORIZED" | "RATE_LIMITED",
    readonly field?: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const notFound = (what: string) => new AppError(`${what} not found.`, "NOT_FOUND");

export function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2002"
  );
}
