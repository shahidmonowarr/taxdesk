import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getSessionToken } from "./cookies";
import { validateSessionToken, type SessionUser, type ValidSession } from "./session";

/**
 * The one place the app asks "who is this?". Deduplicated per request, so a
 * page, its layout and its actions share a single database lookup.
 */
export const getCurrentSession = cache(async (): Promise<ValidSession | null> => {
  const token = await getSessionToken();
  if (!token) return null;
  // Session checks compare against the current time, so they must run per
  // request — never during a prerender.
  await connection();
  return validateSessionToken(token);
});

export async function getCurrentUser(): Promise<SessionUser | null> {
  return (await getCurrentSession())?.user ?? null;
}

/** Every protected page, action and route handler starts here. */
export async function requireSession(): Promise<ValidSession> {
  const session = await getCurrentSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireUser(): Promise<SessionUser> {
  return (await requireSession()).user;
}
