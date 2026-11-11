import type { NextRequest } from "next/server";
import { getCurrentUser } from "@/server/auth/guard";
import { listClients } from "@/server/clients.service";
import { clientSearchSchema } from "@/lib/validation";

/** JSON read API for the signed-in user's clients. Same service, same ownership rule as the UI. */
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { q } = clientSearchSchema.parse({
    q: request.nextUrl.searchParams.get("q") ?? undefined,
  });
  const clients = await listClients(user.id, { q });
  return Response.json({ data: clients, count: clients.length });
}
