"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction } from "@/app/actions/auth";
import { TextField } from "@/components/field";
import { FormAlert, echoed, fieldErrors } from "@/components/form-alert";
import { SubmitButton } from "@/components/submit-button";
import { idle } from "@/lib/result";

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState(loginAction, idle);
  const errors = fieldErrors(state);
  const values = echoed(state);

  return (
    <form action={action} noValidate className="space-y-4">
      <FormAlert state={state} />
      {next && <input type="hidden" name="next" value={next} />}
      <TextField
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        defaultValue={values.email}
        errors={errors.email}
        required
        autoFocus
      />
      <TextField
        name="password"
        label="Password"
        type="password"
        autoComplete="current-password"
        errors={errors.password}
        required
      />
      <SubmitButton className="w-full">Sign in</SubmitButton>
      <p className="text-center text-sm text-slate-600">
        No account?{" "}
        <Link href="/register" className="font-medium text-ink underline-offset-4 hover:underline">
          Create one
        </Link>
      </p>
    </form>
  );
}
