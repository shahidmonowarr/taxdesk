import { z } from "zod";

// Shared by the browser (HTML constraints mirror these) and the server
// (the authoritative check). Never trust a value the server did not parse.

const email = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Email is required.")
  .pipe(z.email("Enter a valid email address."));

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required."),
});

export const PASSWORD_MIN = 10;

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters.").max(80),
    email,
    password: z
      .string()
      .min(PASSWORD_MIN, `Password must be at least ${PASSWORD_MIN} characters.`)
      .max(128, "Password is too long.")
      .regex(/[A-Za-z]/, "Password must contain a letter.")
      .regex(/[0-9]/, "Password must contain a number."),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export const FILING_STATUSES = [
  "SINGLE",
  "MARRIED_JOINT",
  "MARRIED_SEPARATE",
  "HEAD_OF_HOUSEHOLD",
  "QUALIFYING_SURVIVING_SPOUSE",
] as const;

export const FILING_STATUS_LABELS: Record<(typeof FILING_STATUSES)[number], string> = {
  SINGLE: "Single",
  MARRIED_JOINT: "Married filing jointly",
  MARRIED_SEPARATE: "Married filing separately",
  HEAD_OF_HOUSEHOLD: "Head of household",
  QUALIFYING_SURVIVING_SPOUSE: "Qualifying surviving spouse",
};

export const MIN_TAX_YEAR = 2015;
export const maxTaxYear = () => new Date().getUTCFullYear();

/** Empty form fields arrive as "" — store them as null, not as empty strings. */
const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess((v) => (typeof v === "string" && v.trim() === "" ? undefined : v), schema.optional());

export const clientSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required.").max(60),
  lastName: z.string().trim().min(1, "Last name is required.").max(60),
  email,
  phone: optional(
    z
      .string()
      .trim()
      .regex(/^\+?[0-9 ()-]{7,20}$/, "Enter a valid phone number."),
  ),
  // "" would coerce to 0 and read as "too early"; treat blank as missing.
  taxYear: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.coerce
      .number({ error: "Tax year is required." })
      .int("Tax year must be a whole year.")
      .min(MIN_TAX_YEAR, `Tax year must be ${MIN_TAX_YEAR} or later.`)
      .refine((y) => y <= maxTaxYear(), "Tax year cannot be in the future."),
  ),
  filingStatus: z.enum(FILING_STATUSES, { error: "Choose a filing status." }),
  ssnLast4: optional(z.string().trim().regex(/^\d{4}$/, "Enter exactly the last 4 digits.")),
  notes: optional(z.string().trim().max(1000, "Notes must be 1000 characters or fewer.")),
});

export type ClientInput = z.infer<typeof clientSchema>;

export const clientSearchSchema = z.object({
  q: z.string().trim().max(100).optional().catch(undefined),
});
