"use client";

import Link from "next/link";
import { useActionState } from "react";
import { SelectField, TextAreaField, TextField } from "@/components/field";
import { FormAlert, echoed, fieldErrors } from "@/components/form-alert";
import { SubmitButton } from "@/components/submit-button";
import { idle, type FormState } from "@/lib/result";
import { FILING_STATUSES, FILING_STATUS_LABELS, MIN_TAX_YEAR } from "@/lib/validation";

export type ClientFormValues = Partial<Record<
  "firstName" | "lastName" | "email" | "phone" | "taxYear" | "filingStatus" | "ssnLast4" | "notes",
  string
>>;

const statusOptions = FILING_STATUSES.map((s) => ({ value: s, label: FILING_STATUS_LABELS[s] }));

export function ClientForm({
  action,
  initial = {},
  submitLabel,
  maxYear,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  initial?: ClientFormValues;
  submitLabel: string;
  maxYear: number;
}) {
  const [state, formAction] = useActionState(action, idle);
  const errors = fieldErrors(state);
  // After a failed submit, show what the user typed rather than the saved record.
  const v = { ...initial, ...echoed(state) };

  return (
    <form action={formAction} noValidate className="space-y-5">
      <FormAlert state={state} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField name="firstName" label="First name" placeholder="Maria" defaultValue={v.firstName} errors={errors.firstName} required />
        <TextField name="lastName" label="Last name" placeholder="Garcia" defaultValue={v.lastName} errors={errors.lastName} required />
        <TextField name="email" label="Email" type="email" placeholder="maria@example.com" defaultValue={v.email} errors={errors.email} required />
        <TextField name="phone" label="Phone (optional)" type="tel" placeholder="+1 555 010 2030" defaultValue={v.phone} errors={errors.phone} />
        <TextField
          name="taxYear"
          label="Tax year"
          type="number"
          inputMode="numeric"
          min={MIN_TAX_YEAR}
          max={maxYear}
          placeholder={String(maxYear - 1)}
          defaultValue={v.taxYear}
          errors={errors.taxYear}
          required
        />
        <SelectField name="filingStatus" label="Filing status" options={statusOptions} defaultValue={v.filingStatus} errors={errors.filingStatus} required />
        <TextField
          name="ssnLast4"
          label="SSN, last 4 digits (optional)"
          inputMode="numeric"
          maxLength={4}
          placeholder="1234"
          hint="Only the last four digits are ever stored."
          defaultValue={v.ssnLast4}
          errors={errors.ssnLast4}
        />
      </div>
      <TextAreaField name="notes" label="Notes (optional)" placeholder="Prefers email contact. W-2 and 1099-INT expected." defaultValue={v.notes} errors={errors.notes} maxLength={1000} />
      <div className="flex items-center gap-3">
        <SubmitButton>{submitLabel}</SubmitButton>
        <Link href="/clients" className="text-sm font-medium text-slate-600 hover:text-slate-900">
          Cancel
        </Link>
      </div>
    </form>
  );
}
