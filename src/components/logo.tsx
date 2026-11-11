import Link from "next/link";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 font-semibold tracking-tight text-slate-900">
      <span className="grid h-7 w-7 place-items-center rounded-md bg-ink text-xs font-bold text-white">TD</span>
      TaxDesk
    </Link>
  );
}
