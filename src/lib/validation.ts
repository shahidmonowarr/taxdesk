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
