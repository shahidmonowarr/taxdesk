import { describe, expect, it } from "vitest";
import { clientSchema, loginSchema, maxTaxYear, registerSchema } from "@/lib/validation";

const validClient = {
  firstName: " Maria ",
  lastName: "Garcia",
  email: "Maria.Garcia@Example.com ",
  phone: "",
  taxYear: "2024",
  filingStatus: "MARRIED_JOINT",
  ssnLast4: "",
  notes: "",
};

describe("clientSchema", () => {
  it("normalises form input: trims, lowercases email, coerces year, empty strings become undefined", () => {
    const parsed = clientSchema.parse(validClient);
    expect(parsed).toEqual({
      firstName: "Maria",
      lastName: "Garcia",
      email: "maria.garcia@example.com",
      taxYear: 2024,
      filingStatus: "MARRIED_JOINT",
    });
  });

  it.each([
    ["firstName", "", "First name is required."],
    ["email", "not-an-email", "Enter a valid email address."],
    ["taxYear", "", "Tax year is required."],
    ["taxYear", "2014", "Tax year must be 2015 or later."],
    ["taxYear", String(maxTaxYear() + 1), "Tax year cannot be in the future."],
    ["taxYear", "20.5", "Tax year must be a whole year."],
    ["filingStatus", "WIDOWED", "Choose a filing status."],
    ["ssnLast4", "123", "Enter exactly the last 4 digits."],
    ["ssnLast4", "123-45-6789", "Enter exactly the last 4 digits."],
    ["phone", "call me", "Enter a valid phone number."],
  ])("rejects %s = %j", (field, value, message) => {
    const result = clientSchema.safeParse({ ...validClient, [field]: value });
    expect(result.success).toBe(false);
    expect(result.error?.issues.find((i) => i.path[0] === field)?.message).toBe(message);
  });

  it("never accepts a full SSN, so one cannot be stored by mistake", () => {
    expect(clientSchema.safeParse({ ...validClient, ssnLast4: "123456789" }).success).toBe(false);
  });

  it("ignores unknown fields such as ownerId (no mass assignment)", () => {
    const parsed = clientSchema.parse({ ...validClient, ownerId: "someone-else" });
    expect(parsed).not.toHaveProperty("ownerId");
  });
});

describe("registerSchema", () => {
  const base = { name: "Jane", email: "jane@example.com", password: "LongEnough1", confirmPassword: "LongEnough1" };

  it("accepts a valid registration", () => {
    expect(registerSchema.safeParse(base).success).toBe(true);
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
