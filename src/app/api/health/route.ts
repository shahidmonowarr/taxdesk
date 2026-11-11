import { connection } from "next/server";
import { db } from "@/server/db";

/** Liveness + database reachability, for uptime checks and the demo. */
export async function GET() {
  await connection(); // always run at request time, never prerendered
  const started = performance.now();
  try {
    await db.$queryRaw`SELECT 1`;
    return Response.json({
      status: "ok",
      database: "up",
      latencyMs: Math.round(performance.now() - started),
      time: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[health] database unreachable", error);
    return Response.json({ status: "degraded", database: "down" }, { status: 503 });
  }
}
