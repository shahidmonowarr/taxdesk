import { db } from "@/server/db";
import { hashPassword } from "@/server/auth/password";
import type { ClientInput } from "@/lib/validation";

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

export function clientInput(overrides: Partial<ClientInput> = {}): ClientInput {
  n += 1;
  return {
    firstName: "Test",
    lastName: `Client${n}`,
    email: `client${n}@example.com`,
    taxYear: 2024,
    filingStatus: "SINGLE",
    ...overrides,
  };
}
