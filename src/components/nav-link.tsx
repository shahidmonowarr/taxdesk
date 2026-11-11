"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/clients", label: "Clients" },
] as const;

const base = "rounded-md px-3 py-1.5 font-medium transition";
const idleTone = "text-slate-600 hover:text-slate-900";

/**
 * The pathname is request data, so the active highlight streams in behind
 * Suspense; the prerendered shell shows the same links unhighlighted.
 */
export function MainNav() {
  return (
    <nav className="flex gap-1 text-sm">
      <Suspense fallback={LINKS.map((l) => <Link key={l.href} href={l.href} className={`${base} ${idleTone}`}>{l.label}</Link>)}>
        <ActiveLinks />
      </Suspense>
    </nav>
  );
}

function ActiveLinks() {
  const pathname = usePathname();
  return LINKS.map((l) => {
    const active = pathname.startsWith(l.href);
    return (
      <Link
        key={l.href}
        href={l.href}
        aria-current={active ? "page" : undefined}
        className={`${base} ${active ? "bg-slate-100 text-slate-900" : idleTone}`}
      >
        {l.label}
      </Link>
    );
  });
}
