import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader, Skeleton } from "@/components/page-header";
import { getAccountOverview } from "@/server/account.service";
import { requireSession } from "@/server/auth/guard";
import { db } from "@/server/db";

export const metadata: Metadata = { title: "Dashboard" };

const ROLE_LABELS = { ADMIN: "Administrator", PREPARER: "Tax preparer" } as const;

// Server-rendered only, so a fixed zone keeps the output identical everywhere.
const formatDate = (d: Date) =>
  new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(d) + " UTC";

export default function DashboardPage() {
  return (
    <>
      <PageHeader title="Dashboard" description="Your account, your session, and the system it runs on." />
      <Suspense fallback={<Skeleton rows={4} />}>
        <DashboardContent />
      </Suspense>
    </>
  );
}

async function DashboardContent() {
  const session = await requireSession();
  const [{ user, activeSessions }, database] = await Promise.all([
    getAccountOverview(session.user.id),
    checkDatabase(),
  ]);

  return (
    <div className="space-y-6">
      <p className="text-slate-700">
        Welcome back, <span className="font-medium" data-testid="welcome-name">{user.name}</span>.
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Account">
          <Row label="Name" value={user.name} />
          <Row label="Email" value={user.email} />
          <Row label="Role" value={ROLE_LABELS[user.role]} />
          <Row label="Member since" value={formatDate(user.createdAt)} />
        </Card>
        <Card title="This session">
          <Row label="Signed in" value={formatDate(session.createdAt)} />
          <Row label="Expires" value={formatDate(session.expiresAt)} />
          <Row label="Active sessions" value={String(activeSessions)} testId="active-sessions" />
        </Card>
        <Card title="System">
          <Row
            label="Database"
            value={database.up ? `Connected · ${database.latencyMs} ms` : "Unreachable"}
            tone={database.up ? "ok" : "bad"}
            testId="db-status"
          />
          <Row label="Health check" value="/api/health" />
        </Card>
      </div>
    </div>
  );
}

async function checkDatabase() {
  const started = performance.now();
  try {
    await db.$queryRaw`SELECT 1`;
    return { up: true, latencyMs: Math.round(performance.now() - started) };
  } catch (error) {
    console.error("[dashboard] database check failed", error);
    return { up: false, latencyMs: null };
  }
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="mb-3 font-semibold text-slate-900">{title}</h2>
      <dl className="space-y-2.5 text-sm">{children}</dl>
    </section>
  );
}

function Row({
  label,
  value,
  tone,
  testId,
}: {
  label: string;
  value: string;
  tone?: "ok" | "bad";
  testId?: string;
}) {
  const color = tone === "ok" ? "text-emerald-700" : tone === "bad" ? "text-red-700" : "text-slate-900";
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-slate-500">{label}</dt>
      <dd className={`text-right font-medium ${color}`} data-testid={testId}>
        {value}
      </dd>
    </div>
  );
}
