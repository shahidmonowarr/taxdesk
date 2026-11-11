const MESSAGES: Record<string, string> = {
  created: "Client added.",
  updated: "Client updated.",
  deleted: "Client deleted.",
};

export function Flash({ code }: { code?: string }) {
  const message = code ? MESSAGES[code] : undefined;
  if (!message) return null;
  return (
    <div role="status" className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
      {message}
    </div>
  );
}
