import "server-only";
import { db } from "@/server/db";
import { AppError, isUniqueViolation } from "@/server/errors";
import { clearFailures, isRateLimited, recordFailure } from "@/server/rate-limit";
import { hashPassword, verifyPassword } from "./password";
import type { SessionUser } from "./session";

// Verified against when the email is unknown, so "no such user" and "wrong
// password" take the same time and an attacker cannot enumerate accounts.
let dummyHash: Promise<string> | undefined;
const getDummyHash = () => (dummyHash ??= hashPassword("not-a-real-password-0"));

const INVALID = "Incorrect email or password.";

export async function authenticate(email: string, password: string): Promise<SessionUser> {
  const key = `login:${email}`;
  if (await isRateLimited(key)) {
    throw new AppError("Too many failed attempts. Try again in 15 minutes.", "RATE_LIMITED");
  }

  const user = await db.user.findUnique({ where: { email } });
  const ok = await verifyPassword(user?.passwordHash ?? (await getDummyHash()), password);

  if (!user || !ok) {
    await recordFailure(key);
    throw new AppError(INVALID, "UNAUTHORIZED");
  }

  await clearFailures(key);
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
}): Promise<SessionUser> {
  try {
    const user = await db.user.create({
      data: { name: input.name, email: input.email, passwordHash: await hashPassword(input.password) },
      select: { id: true, email: true, name: true, role: true },
    });
    return user;
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new AppError("An account with this email already exists.", "CONFLICT", "email");
    }
    throw error;
  }
}
