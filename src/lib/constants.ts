/** Shared with proxy.ts, which must not import server-only modules. */
export const SESSION_COOKIE = "taxdesk_session";
export const PROTECTED_PREFIXES = ["/dashboard", "/clients"] as const;
