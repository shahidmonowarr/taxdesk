import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getSessionToken } from "./cookies";
import { validateSessionToken, type SessionUser } from "./session";

/**
 * The one place the app asks "who is this?". Deduplicated per request, so a
 * page, its layout and its actions share a single database lookup.
 */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const token = await getSessionToken();
  if (!token) return null;
  // Session checks compare against the current time, so they must run per
  // request — never during a prerender.
  await connection();
  const result = await validateSessionToken(token);
  return result?.user ?? null;
});

/** Every protected page, action and route handler starts here. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
