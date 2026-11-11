import "server-only";
import { cookies } from "next/headers";

import { SESSION_COOKIE } from "@/lib/constants";

export async function setSessionCookie(token: string, expiresAt: Date) {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true, // not readable from JavaScript, so XSS cannot steal it
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax", // not sent on cross-site POSTs (CSRF)
    path: "/",
    expires: expiresAt,
  });
}

export async function getSessionToken(): Promise<string | undefined> {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}

export async function clearSessionCookie() {
  (await cookies()).delete(SESSION_COOKIE);
}
