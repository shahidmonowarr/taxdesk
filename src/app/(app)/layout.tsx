import { Suspense } from "react";
import { logoutAction } from "@/app/actions/auth";
import { Logo } from "@/components/logo";
import { MainNav } from "@/components/nav-link";
import { SubmitButton } from "@/components/submit-button";
import { requireUser } from "@/server/auth/guard";

/**
 * Workspace chrome. The header renders instantly; only the user menu waits
 * on the session. Each page still calls requireUser() itself — a layout does
 * not re-run on client navigation, so it must never be the only check.
 */
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-6 px-4 sm:px-6">
          <Logo href="/dashboard" />
          <MainNav />
          <div className="ml-auto">
            <Suspense fallback={<div className="h-8 w-40 animate-pulse rounded bg-slate-100" />}>
              <UserMenu />
            </Suspense>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}

async function UserMenu() {
  const user = await requireUser();
  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right leading-tight sm:block">
        <p className="text-sm font-medium text-slate-900" data-testid="current-user">{user.name}</p>
        <p className="text-xs text-slate-500">{user.email}</p>
      </div>
      <form action={logoutAction}>
        <SubmitButton variant="danger" className="h-8 px-3 text-xs">
          Sign out
        </SubmitButton>
      </form>
    </div>
  );
}
