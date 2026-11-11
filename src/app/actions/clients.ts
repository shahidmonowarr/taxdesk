"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/server/auth/guard";
import { createClient, deleteClient, updateClient } from "@/server/clients.service";
import { toFormError } from "@/server/action-errors";
import { formValues, validationError, type FormState } from "@/lib/result";
import { clientSchema } from "@/lib/validation";

// Each action re-checks the session itself. A server action is a public POST
// endpoint; the page that rendered the form proves nothing about the caller.

export async function createClientAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const values = formValues(formData);
  const parsed = clientSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return validationError(parsed.error, values);

  try {
    await createClient(user.id, parsed.data);
  } catch (error) {
    return toFormError(error, values);
  }
  revalidatePath("/", "layout");
  redirect("/clients?flash=created");
}

export async function updateClientAction(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const values = formValues(formData);
  const parsed = clientSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return validationError(parsed.error, values);

  try {
    await updateClient(user.id, id, parsed.data);
  } catch (error) {
    return toFormError(error, values);
  }
  revalidatePath("/", "layout");
  redirect("/clients?flash=updated");
}

export async function deleteClientAction(id: string): Promise<FormState> {
  const user = await requireUser();
  try {
    await deleteClient(user.id, id);
  } catch (error) {
    return toFormError(error, {});
  }
  revalidatePath("/", "layout");
  redirect("/clients?flash=deleted");
}
