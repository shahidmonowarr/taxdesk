import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/server/auth/password";
import { generateSessionToken, hashToken } from "@/server/auth/tokens";
import { safeNextPath } from "@/lib/safe-redirect";

describe("password hashing", () => {
  it("verifies the right password and rejects the wrong one", async () => {
    const hash = await hashPassword("CorrectHorse9");
    expect(hash).toMatch(/^\$argon2id\$/);
    expect(hash).not.toContain("CorrectHorse9");
    await expect(verifyPassword(hash, "CorrectHorse9")).resolves.toBe(true);
    await expect(verifyPassword(hash, "WrongHorse9")).resolves.toBe(false);
  });

  it("salts every hash", async () => {
    expect(await hashPassword("same")).not.toBe(await hashPassword("same"));
  });

  it("treats a malformed hash as a failed match instead of throwing", async () => {
    await expect(verifyPassword("not-a-hash", "anything")).resolves.toBe(false);
  });
});

describe("session tokens", () => {
  it("are long, URL-safe and unique", () => {
    const tokens = new Set(Array.from({ length: 1000 }, generateSessionToken));
    expect(tokens.size).toBe(1000);
    for (const t of tokens) expect(t).toMatch(/^[A-Za-z0-9_-]{43}$/);
  });

  it("are stored only as a deterministic SHA-256 hash", () => {
    const token = generateSessionToken();
    expect(hashToken(token)).toBe(hashToken(token));
    expect(hashToken(token)).toMatch(/^[a-f0-9]{64}$/);
    expect(hashToken(token)).not.toContain(token);
  });
});

describe("safeNextPath (open-redirect guard)", () => {
  it.each([
    ["/clients?q=a", "/clients?q=a"],
    ["/dashboard", "/dashboard"],
    ["//evil.com", "/dashboard"],
    ["https://evil.com", "/dashboard"],
    ["/\\evil.com", "/dashboard"],
    ["javascript:alert(1)", "/dashboard"],
    [null, "/dashboard"],
  ])("%j -> %j", (input, expected) => {
    expect(safeNextPath(input)).toBe(expected);
  });
});
