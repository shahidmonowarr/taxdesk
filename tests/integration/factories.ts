import { db } from "@/server/db";
import { hashPassword } from "@/server/auth/password";

let n = 0;

export async function makeUser(overrides: { email?: string; password?: string; name?: string } = {}) {
  n += 1;
  const password = overrides.password ?? "CorrectHorse9";
  const user = await db.user.create({
    data: {
      email: overrides.email ?? `user${n}@test.dev`,
      name: overrides.name ?? `User ${n}`,
      passwordHash: await hashPassword(password),
    },
  });
  return { ...user, password };
}
