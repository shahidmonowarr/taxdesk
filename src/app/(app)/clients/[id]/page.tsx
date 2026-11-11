import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { deleteClientAction, updateClientAction } from "@/app/actions/clients";
import { PageHeader, Skeleton } from "@/components/page-header";
import { requireUser } from "@/server/auth/guard";
import { getClient } from "@/server/clients.service";
import { AppError } from "@/server/errors";
import { maxTaxYear } from "@/lib/validation";
import { ClientForm } from "../client-form";
import { DeleteClientButton } from "./delete-button";

export const metadata: Metadata = { title: "Edit client" };

export default function EditClientPage(props: PageProps<"/clients/[id]">) {
  return (
    <div className="max-w-3xl">
      <PageHeader title="Edit client" />
      <Suspense fallback={<Skeleton rows={5} />}>
        <EditClient params={props.params} />
      </Suspense>
    </div>
  );
}

async function EditClient({ params }: Pick<PageProps<"/clients/[id]">, "params">) {
  const user = await requireUser();
  const { id } = await params;

  const client = await getClient(user.id, id).catch((error) => {
    if (error instanceof AppError && error.code === "NOT_FOUND") notFound();
    throw error;
  });

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <ClientForm
          action={updateClientAction.bind(null, client.id)}
          submitLabel="Save changes"
          maxYear={maxTaxYear()}
          initial={{
            firstName: client.firstName,
            lastName: client.lastName,
            email: client.email,
            phone: client.phone ?? "",
            taxYear: String(client.taxYear),
            filingStatus: client.filingStatus,
            ssnLast4: client.ssnLast4 ?? "",
            notes: client.notes ?? "",
          }}
        />
      </div>
      <div className="flex items-center justify-between rounded-xl border border-red-200 bg-white p-5">
        <div>
          <h2 className="font-medium text-slate-900">Delete this client</h2>
          <p className="text-sm text-slate-600">This permanently removes the record.</p>
        </div>
        <DeleteClientButton action={deleteClientAction.bind(null, client.id)} name={`${client.firstName} ${client.lastName}`} />
      </div>
    </div>
  );
}
