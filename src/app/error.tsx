"use client";

import { useEffect } from "react";

/** Last-resort boundary. Shows a reference, never the error text itself. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-24 text-center">
      <h1 className="text-2xl font-semibold text-slate-900">Something went wrong</h1>
      <p className="text-slate-600">The error has been logged. Please try again.</p>
      {error.digest && <p className="font-mono text-xs text-slate-400">Reference: {error.digest}</p>}
      <button onClick={reset} className="mt-2 h-10 rounded-md bg-ink px-4 text-sm font-medium text-white hover:bg-ink-hover">
        Try again
      </button>
    </main>
  );
}
