import { describe, expect, it } from "vitest";
import { db } from "@/server/db";
import { authenticate, registerUser } from "@/server/auth/auth.service";
import {
  SESSION_REFRESH_MS,
  SESSION_TTL_MS,
  createSession,
  invalidateAllSessions,
  invalidateSession,
  validateSessionToken,
} from "@/server/auth/session";
import { hashToken } from "@/server/auth/tokens";
import { LOGIN_MAX_FAILURES } from "@/server/rate-limit";
import { makeUser } from "./factories";

describe("registerUser", () => {
  it("creates a user with a hashed password", async () => {
    const user = await registerUser({ name: "Jane", email: "jane@test.dev", password: "LongEnough1" });
    const row = await db.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(row.passwordHash).not.toBe("LongEnough1");
    expect(user).not.toHaveProperty("passwordHash");
    expect(user.role).toBe("PREPARER");
  });

  it("refuses a duplicate email with a field-level error", async () => {
    await makeUser({ email: "taken@test.dev" });
    await expect(
      registerUser({ name: "Again", email: "taken@test.dev", password: "LongEnough1" }),
    ).rejects.toMatchObject({ code: "CONFLICT", field: "email" });
  });
});

describe("authenticate", () => {
  it("returns the user for correct credentials", async () => {
    const u = await makeUser();
    await expect(authenticate(u.email, u.password)).resolves.toMatchObject({ id: u.id, email: u.email });
  });

  it("gives the same message for a wrong password and an unknown email", async () => {
    const u = await makeUser();
    const wrong = await authenticate(u.email, "nope").catch((e: Error) => e.message);
    const unknown = await authenticate("ghost@test.dev", "nope").catch((e: Error) => e.message);
    expect(wrong).toBe("Incorrect email or password.");
    expect(unknown).toBe(wrong);
  });

  it(`locks the account after ${LOGIN_MAX_FAILURES} failures, even for the right password`, async () => {
    const u = await makeUser();
    for (let i = 0; i < LOGIN_MAX_FAILURES; i++) {
      await expect(authenticate(u.email, "wrong")).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    }
    await expect(authenticate(u.email, u.password)).rejects.toMatchObject({ code: "RATE_LIMITED" });
  });

  it("clears the failure count after a successful sign-in", async () => {
    const u = await makeUser();
    for (let i = 0; i < LOGIN_MAX_FAILURES - 1; i++) await authenticate(u.email, "wrong").catch(() => {});
    await authenticate(u.email, u.password);
    expect(await db.loginAttempt.count()).toBe(0);
  });
});

describe("sessions", () => {
  it("stores only the token hash and resolves the token back to its user", async () => {
    const u = await makeUser();
    const { token } = await createSession(u.id);
    const row = await db.session.findFirstOrThrow({ where: { userId: u.id } });
    expect(row.tokenHash).toBe(hashToken(token));
    expect(row.tokenHash).not.toBe(token);
    await expect(validateSessionToken(token)).resolves.toMatchObject({ user: { id: u.id } });
  });

  it("rejects an unknown token", async () => {
    await expect(validateSessionToken("forged-token")).resolves.toBeNull();
  });

  it("rejects and deletes an expired session", async () => {
    const u = await makeUser();
    const start = new Date("2026-01-01T00:00:00Z");
    const { token } = await createSession(u.id, start);
    const later = new Date(start.getTime() + SESSION_TTL_MS + 1);
    await expect(validateSessionToken(token, later)).resolves.toBeNull();
    expect(await db.session.count()).toBe(0);
  });

  it("slides the expiry forward once past half its life", async () => {
    const u = await makeUser();
    const start = new Date("2026-01-01T00:00:00Z");
    const { token, expiresAt } = await createSession(u.id, start);

    const early = new Date(start.getTime() + 1000);
    expect((await validateSessionToken(token, early))?.expiresAt).toEqual(expiresAt);

    const late = new Date(start.getTime() + SESSION_REFRESH_MS + 1000);
    const refreshed = await validateSessionToken(token, late);
    expect(refreshed?.expiresAt.getTime()).toBe(late.getTime() + SESSION_TTL_MS);
  });

  it("logout invalidates the session server-side", async () => {
    const u = await makeUser();
    const { token } = await createSession(u.id);
    await invalidateSession(token);
    await expect(validateSessionToken(token)).resolves.toBeNull();
  });

  it("can revoke every session of a user", async () => {
    const u = await makeUser();
    const a = await createSession(u.id);
    const b = await createSession(u.id);
    await invalidateAllSessions(u.id);
    await expect(validateSessionToken(a.token)).resolves.toBeNull();
    await expect(validateSessionToken(b.token)).resolves.toBeNull();
  });
});
