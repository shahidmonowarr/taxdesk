import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "@/lib/validation";

describe("registerSchema", () => {
  const base = { name: "Jane", email: "jane@example.com", password: "LongEnough1", confirmPassword: "LongEnough1" };

  it("accepts a valid registration and normalises the email", () => {
    const parsed = registerSchema.parse({ ...base, name: "  Jane  ", email: " Jane@Example.COM " });
    expect(parsed.name).toBe("Jane");
    expect(parsed.email).toBe("jane@example.com");
  });

  it("rejects an invalid email", () => {
    const result = registerSchema.safeParse({ ...base, email: "not-an-email" });
    expect(result.error?.issues[0]?.message).toBe("Enter a valid email address.");
  });

  it("ignores unknown fields such as role (no mass assignment)", () => {
    expect(registerSchema.parse({ ...base, role: "ADMIN" })).not.toHaveProperty("role");
  });

  it.each([
    [{ password: "short1", confirmPassword: "short1" }, "password"],
    [{ password: "onlyletterslong", confirmPassword: "onlyletterslong" }, "password"],
    [{ password: "1234567890", confirmPassword: "1234567890" }, "password"],
    [{ confirmPassword: "Different123" }, "confirmPassword"],
    [{ name: "J" }, "name"],
  ])("rejects %j on %s", (overrides, field) => {
    const result = registerSchema.safeParse({ ...base, ...overrides });
    expect(result.success).toBe(false);
    expect(result.error?.issues.some((i) => i.path[0] === field)).toBe(true);
  });
});

describe("loginSchema", () => {
  it("requires both fields", () => {
    const result = loginSchema.safeParse({ email: "", password: "" });
    expect(result.success).toBe(false);
    expect(result.error?.issues.map((i) => i.path[0]).sort()).toEqual(["email", "password"]);
  });
});
