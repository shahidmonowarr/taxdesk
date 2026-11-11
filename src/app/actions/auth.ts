"use server";

import { redirect } from "next/navigation";
import { authenticate, registerUser } from "@/server/auth/auth.service";
import { clearSessionCookie, getSessionToken, setSessionCookie } from "@/server/auth/cookies";
import { createSession, invalidateSession } from "@/server/auth/session";
import { toFormError } from "@/server/action-errors";
import { formValues, validationError, type FormState } from "@/lib/result";
import { safeNextPath } from "@/lib/safe-redirect";
import { loginSchema, registerSchema } from "@/lib/validation";

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = formValues(formData);
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return validationError(parsed.error, values);

  try {
    const user = await authenticate(parsed.data.email, parsed.data.password);
    const { token, expiresAt } = await createSession(user.id);
    await setSessionCookie(token, expiresAt);
  } catch (error) {
    return toFormError(error, values);
  }
  // redirect() throws by design, so it stays outside the try block.
  redirect(safeNextPath(formData.get("next")));
}

export async function registerAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = formValues(formData);
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return validationError(parsed.error, values);

  try {
    const user = await registerUser(parsed.data);
    const { token, expiresAt } = await createSession(user.id);
    await setSessionCookie(token, expiresAt);
  } catch (error) {
    return toFormError(error, values);
  }
  redirect("/dashboard");
}

export async function logoutAction() {
  const token = await getSessionToken();
  // Delete the server-side session, not just the cookie: a copied cookie
  // must stop working the moment the user signs out.
  if (token) await invalidateSession(token);
  await clearSessionCookie();
  redirect("/login");
}
