import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-24 text-center">
      <p className="text-sm font-medium text-slate-500">404</p>
      <h1 className="text-2xl font-semibold text-slate-900">Page not found</h1>
      <p className="text-slate-600">It may have been moved or deleted, or it belongs to another account.</p>
      <Link href="/dashboard" className="mt-2 text-sm font-medium text-ink hover:underline">Back to dashboard</Link>
    </main>
  );
}
