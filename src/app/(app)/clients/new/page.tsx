import type { Metadata } from "next";
import { Suspense } from "react";
import { createClientAction } from "@/app/actions/clients";
import { PageHeader, Skeleton } from "@/components/page-header";
import { requireUser } from "@/server/auth/guard";
import { maxTaxYear } from "@/lib/validation";
import { ClientForm } from "../client-form";

export const metadata: Metadata = { title: "Add client" };

export default function NewClientPage() {
  return (
    <div className="max-w-3xl">
      <PageHeader title="Add client" />
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <Suspense fallback={<Skeleton rows={4} />}>
          <NewClientForm />
        </Suspense>
      </div>
    </div>
  );
}

async function NewClientForm() {
  await requireUser();
  return <ClientForm action={createClientAction} submitLabel="Save client" maxYear={maxTaxYear()} />;
}
