import "server-only";
import { db } from "@/server/db";

export const LOGIN_WINDOW_MS = 15 * 60 * 1000;
export const LOGIN_MAX_FAILURES = 5;

/** Failed sign-ins for this key inside the window. */
export async function isRateLimited(key: string, now = new Date()): Promise<boolean> {
  const since = new Date(now.getTime() - LOGIN_WINDOW_MS);
  const failures = await db.loginAttempt.count({ where: { key, createdAt: { gt: since } } });
  return failures >= LOGIN_MAX_FAILURES;
}

export async function recordFailure(key: string, now = new Date()) {
  await db.loginAttempt.create({ data: { key, createdAt: now } });
  // Opportunistic cleanup keeps the table small without a cron job.
  await db.loginAttempt.deleteMany({
    where: { createdAt: { lt: new Date(now.getTime() - LOGIN_WINDOW_MS) } },
  });
}

export async function clearFailures(key: string) {
  await db.loginAttempt.deleteMany({ where: { key } });
}
