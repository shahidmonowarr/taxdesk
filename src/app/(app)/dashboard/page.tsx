import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageHeader, Skeleton } from "@/components/page-header";
import { requireUser } from "@/server/auth/guard";
import { getDashboardStats } from "@/server/clients.service";
import { FILING_STATUS_LABELS } from "@/lib/validation";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <>
      <PageHeader title="Dashboard" description="An overview of your client records." />
      <Suspense fallback={<Skeleton rows={5} />}>
        <DashboardContent />
      </Suspense>
    </>
  );
}

async function DashboardContent() {
  const user = await requireUser();
  const stats = await getDashboardStats(user.id);

  return (
    <div className="space-y-6">
      <p className="text-slate-700">
        Welcome back, <span className="font-medium">{user.name}</span>.
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Clients" value={stats.total} testId="stat-total" />
        <Stat label="Current & last tax year" value={stats.recentTaxYears} />
        <Stat label="Filing statuses in use" value={stats.byStatus.length} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Recently updated</h2>
            <Link href="/clients" className="text-sm font-medium text-ink hover:underline">
              All clients
            </Link>
          </div>
          {stats.recent.length === 0 ? (
            <p className="text-sm text-slate-600">
              No clients yet.{" "}
              <Link href="/clients/new" className="font-medium text-ink hover:underline">
                Add the first one
              </Link>
              .
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {stats.recent.map((c) => (
                <li key={c.id} className="flex items-center justify-between py-2.5 text-sm">
                  <Link href={`/clients/${c.id}`} className="font-medium text-slate-900 hover:underline">
                    {c.lastName}, {c.firstName}
                  </Link>
                  <span className="text-slate-500">
                    {c.taxYear} · {FILING_STATUS_LABELS[c.filingStatus]}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-3 font-semibold text-slate-900">By filing status</h2>
          <ul className="space-y-2 text-sm">
            {stats.byStatus.map((s) => (
              <li key={s.status} className="flex justify-between">
                <span className="text-slate-600">{FILING_STATUS_LABELS[s.status]}</span>
                <span className="font-medium tabular-nums text-slate-900">{s.count}</span>
              </li>
            ))}
            {stats.byStatus.length === 0 && <li className="text-slate-500">Nothing yet.</li>}
          </ul>
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value, testId }: { label: string; value: number; testId?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-semibold tabular-nums text-slate-900" data-testid={testId}>
        {value}
      </p>
    </div>
  );
}
