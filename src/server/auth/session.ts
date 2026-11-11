import "server-only";
import { db } from "@/server/db";
import { generateSessionToken, hashToken } from "./tokens";

export const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days
/** Extend a session only when it is past half its life — one write per ~3.5 days, not per request. */
export const SESSION_REFRESH_MS = SESSION_TTL_MS / 2;

export type SessionUser = { id: string; email: string; name: string; role: "ADMIN" | "PREPARER" };

export async function createSession(userId: string, now = new Date()) {
  const token = generateSessionToken();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_MS);
  await db.session.create({ data: { tokenHash: hashToken(token), userId, expiresAt } });
  return { token, expiresAt };
}

/**
 * Resolves a cookie token to its user. Expired sessions are deleted and
 * treated as absent; live sessions near expiry slide forward.
 */
export async function validateSessionToken(
  token: string,
  now = new Date(),
): Promise<{ user: SessionUser; expiresAt: Date } | null> {
  const session = await db.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: { select: { id: true, email: true, name: true, role: true } } },
  });
  if (!session) return null;

  if (session.expiresAt.getTime() <= now.getTime()) {
    await db.session.deleteMany({ where: { id: session.id } });
    return null;
  }

  let expiresAt = session.expiresAt;
  if (expiresAt.getTime() - now.getTime() < SESSION_REFRESH_MS) {
    expiresAt = new Date(now.getTime() + SESSION_TTL_MS);
    await db.session.update({ where: { id: session.id }, data: { expiresAt, lastSeenAt: now } });
  }
  return { user: session.user, expiresAt };
}

export async function invalidateSession(token: string) {
  await db.session.deleteMany({ where: { tokenHash: hashToken(token) } });
}

export async function invalidateAllSessions(userId: string) {
  await db.session.deleteMany({ where: { userId } });
}
