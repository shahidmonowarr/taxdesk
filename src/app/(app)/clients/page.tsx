import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Flash } from "@/components/flash";
import { PageHeader, Skeleton } from "@/components/page-header";
import { requireUser } from "@/server/auth/guard";
import { listClients } from "@/server/clients.service";
import { FILING_STATUS_LABELS, clientSearchSchema } from "@/lib/validation";

export const metadata: Metadata = { title: "Clients" };

export default function ClientsPage(props: PageProps<"/clients">) {
  return (
    <>
      <PageHeader
        title="Clients"
        description="Taxpayers you prepare returns for."
        action={
          <Link href="/clients/new" className="inline-flex h-10 items-center rounded-md bg-ink px-4 text-sm font-medium text-white hover:bg-ink-hover">
            Add client
          </Link>
        }
      />
      <Suspense fallback={<Skeleton rows={6} />}>
        <ClientsContent searchParams={props.searchParams} />
      </Suspense>
    </>
  );
}

async function ClientsContent({ searchParams }: Pick<PageProps<"/clients">, "searchParams">) {
  const user = await requireUser();
  const params = await searchParams;
  const { q } = clientSearchSchema.parse({ q: typeof params.q === "string" ? params.q : undefined });
  const flash = typeof params.flash === "string" ? params.flash : undefined;
  const clients = await listClients(user.id, { q });

  return (
    <div className="space-y-4">
      <Flash code={flash} />
      <form role="search" className="flex gap-2">
        <label htmlFor="q" className="sr-only">Search clients</label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Search by name or email"
          className="h-10 w-full max-w-sm rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-ink focus:ring-2 focus:ring-ink/15"
        />
        <button className="h-10 rounded-md bg-white px-4 text-sm font-medium text-slate-800 ring-1 ring-slate-300 hover:bg-slate-50">
          Search
        </button>
        {q && (
          <Link href="/clients" className="inline-flex h-10 items-center px-2 text-sm text-slate-600 hover:text-slate-900">
            Clear
          </Link>
        )}
      </form>

      {clients.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-600">
          {q ? <>No clients match “{q}”.</> : <>No clients yet. <Link href="/clients/new" className="font-medium text-ink hover:underline">Add your first client</Link>.</>}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Name</th>
                <th scope="col" className="px-4 py-3 font-medium">Email</th>
                <th scope="col" className="px-4 py-3 font-medium">Tax year</th>
                <th scope="col" className="px-4 py-3 font-medium">Filing status</th>
                <th scope="col" className="px-4 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clients.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3 font-medium text-slate-900">{c.lastName}, {c.firstName}</td>
                  <td className="px-4 py-3 text-slate-600">{c.email}</td>
                  <td className="px-4 py-3 tabular-nums text-slate-700">{c.taxYear}</td>
                  <td className="px-4 py-3 text-slate-700">{FILING_STATUS_LABELS[c.filingStatus]}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/clients/${c.id}`} className="font-medium text-ink hover:underline" aria-label={`Edit ${c.firstName} ${c.lastName}`}>
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="border-t border-slate-100 px-4 py-2 text-xs text-slate-500">{clients.length} client{clients.length === 1 ? "" : "s"}</p>
        </div>
      )}
    </div>
  );
}
