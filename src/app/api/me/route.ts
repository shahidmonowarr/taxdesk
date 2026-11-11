import { getCurrentSession } from "@/server/auth/guard";

/**
 * The signed-in user as JSON, or 401. Shows that Route Handlers go through
 * the same session check as pages and Server Actions.
 */
export async function GET() {
  const session = await getCurrentSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return Response.json({ user: session.user, sessionExpiresAt: session.expiresAt });
}
