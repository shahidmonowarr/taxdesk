import Link from "next/link";
import { DemoCredentials } from "@/components/demo-credentials";
import { Logo } from "@/components/logo";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-10 px-6 py-16">
      <Logo />
      <div className="space-y-4">
        <h1 className="text-4xl font-semibold tracking-tight text-slate-900">
          A secure foundation for a tax-preparation app.
        </h1>
        <p className="max-w-xl text-lg text-slate-600">
          A small, production-shaped base project: session authentication, a protected dashboard,
          validated forms, PostgreSQL through Prisma, and tests at every layer.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link href="/login" className="inline-flex h-10 items-center rounded-md bg-ink px-5 text-sm font-medium text-white hover:bg-ink-hover">
          Sign in
        </Link>
        <Link href="/register" className="inline-flex h-10 items-center rounded-md bg-white px-5 text-sm font-medium text-slate-800 ring-1 ring-slate-300 hover:bg-slate-50">
          Create an account
        </Link>
      </div>
      <DemoCredentials />
    </main>
  );
}
