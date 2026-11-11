/**
 * Only same-site relative paths survive; anything else ("//evil.com",
 * "https://…", "/\evil.com") falls back. Prevents open-redirect phishing via
 * /login?next=…
 */
export function safeNextPath(next: unknown, fallback = "/dashboard"): string {
  if (typeof next !== "string") return fallback;
  if (!next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return fallback;
  return next;
}
