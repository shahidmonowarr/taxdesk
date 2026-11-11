import { describe, expect, it } from "vitest";
import { getAccountOverview } from "@/server/account.service";
import { createSession } from "@/server/auth/session";
import { db } from "@/server/db";
import { makeUser } from "./factories";

describe("getAccountOverview", () => {
  it("returns the user's public fields, never the password hash", async () => {
    const u = await makeUser({ name: "Dana", email: "dana@test.dev" });
    const { user } = await getAccountOverview(u.id);
    expect(user).toMatchObject({ id: u.id, name: "Dana", email: "dana@test.dev", role: "PREPARER" });
    expect(user).not.toHaveProperty("passwordHash");
  });

  it("counts only this user's unexpired sessions", async () => {
    const now = new Date("2026-06-01T00:00:00Z");
    const u = await makeUser();
    const other = await makeUser();
    await createSession(u.id, now);
    await createSession(u.id, now);
    await createSession(other.id, now);
    await db.session.create({
      data: { userId: u.id, tokenHash: "expired", expiresAt: new Date(now.getTime() - 1) },
    });

    expect((await getAccountOverview(u.id, now)).activeSessions).toBe(2);
  });

  it("is NOT_FOUND for a deleted user", async () => {
    const u = await makeUser();
    await db.user.delete({ where: { id: u.id } });
    await expect(getAccountOverview(u.id)).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
