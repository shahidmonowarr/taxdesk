"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerAction } from "@/app/actions/auth";
import { TextField } from "@/components/field";
import { FormAlert, echoed, fieldErrors } from "@/components/form-alert";
import { SubmitButton } from "@/components/submit-button";
import { idle } from "@/lib/result";
import { PASSWORD_MIN } from "@/lib/validation";

export function RegisterForm() {
  const [state, action] = useActionState(registerAction, idle);
  const errors = fieldErrors(state);
  const values = echoed(state);

  return (
    <form action={action} noValidate className="space-y-4">
      <FormAlert state={state} />
      <TextField name="name" label="Full name" autoComplete="name" placeholder="Jane Cooper" defaultValue={values.name} errors={errors.name} required autoFocus />
      <TextField name="email" label="Email" type="email" autoComplete="email" placeholder="you@example.com" defaultValue={values.email} errors={errors.email} required />
      <TextField
        name="password"
        label="Password"
        type="password"
        autoComplete="new-password"
        minLength={PASSWORD_MIN}
        hint={`At least ${PASSWORD_MIN} characters, with a letter and a number.`}
        errors={errors.password}
        required
      />
      <TextField name="confirmPassword" label="Confirm password" type="password" autoComplete="new-password" errors={errors.confirmPassword} required />
      <SubmitButton className="w-full">Create account</SubmitButton>
      <p className="text-center text-sm text-slate-600">
        Already registered?{" "}
        <Link href="/login" className="font-medium text-ink underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
