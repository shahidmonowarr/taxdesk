import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/guard";
import { DemoCredentials } from "@/components/demo-credentials";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage(props: PageProps<"/login">) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="mb-5 text-xl font-semibold text-slate-900">Sign in</h1>
        <Suspense fallback={<FormSkeleton />}>
          <LoginContent searchParams={props.searchParams} />
        </Suspense>
      </div>
      <DemoCredentials />
    </div>
  );
}

async function LoginContent({ searchParams }: Pick<PageProps<"/login">, "searchParams">) {
  // Already signed in? Go straight to the workspace.
  if (await getCurrentUser()) redirect("/dashboard");
  const { next } = await searchParams;
  return <LoginForm next={typeof next === "string" ? next : undefined} />;
}

function FormSkeleton() {
  return (
    <div className="space-y-4" aria-hidden>
      <div className="h-16 animate-pulse rounded-md bg-slate-100" />
      <div className="h-16 animate-pulse rounded-md bg-slate-100" />
      <div className="h-10 animate-pulse rounded-md bg-slate-100" />
    </div>
  );
}
