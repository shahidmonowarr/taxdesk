import "server-only";
import { db } from "@/server/db";
import { notFound } from "@/server/errors";

/** What the dashboard shows about the signed-in user. Never returns the password hash. */
export async function getAccountOverview(userId: string, now = new Date()) {
  const [user, activeSessions] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    }),
    db.session.count({ where: { userId, expiresAt: { gt: now } } }),
  ]);
  if (!user) throw notFound("User");
  return { user, activeSessions };
}
