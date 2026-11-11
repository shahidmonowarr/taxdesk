import "server-only";
import { db } from "@/server/db";
import { AppError, isUniqueViolation, notFound } from "@/server/errors";
import type { ClientInput } from "@/lib/validation";
import type { Prisma } from "@/generated/prisma/client";

// Every function takes ownerId first and every query filters on it. A client
// that belongs to someone else is indistinguishable from one that does not
// exist — both are NOT_FOUND, so ids cannot be probed.

const duplicate = () =>
  new AppError("This client already has a record for that tax year.", "CONFLICT", "email");

export async function listClients(ownerId: string, opts: { q?: string } = {}) {
  const where: Prisma.ClientWhereInput = { ownerId };
  if (opts.q) {
    where.OR = [
      { firstName: { contains: opts.q, mode: "insensitive" } },
      { lastName: { contains: opts.q, mode: "insensitive" } },
      { email: { contains: opts.q, mode: "insensitive" } },
    ];
  }
  return db.client.findMany({
    where,
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }, { taxYear: "desc" }],
    take: 200,
  });
}

export async function getClient(ownerId: string, id: string) {
  const client = await db.client.findFirst({ where: { id, ownerId } });
  if (!client) throw notFound("Client");
  return client;
}

export async function createClient(ownerId: string, input: ClientInput) {
  try {
    return await db.client.create({ data: { ...input, ownerId } });
  } catch (error) {
    if (isUniqueViolation(error)) throw duplicate();
    throw error;
  }
}

export async function updateClient(ownerId: string, id: string, input: ClientInput) {
  try {
    // updateMany with the owner in the filter: one statement, no read-then-write race.
    const { count } = await db.client.updateMany({
      where: { id, ownerId },
      data: {
        ...input,
        phone: input.phone ?? null,
        ssnLast4: input.ssnLast4 ?? null,
        notes: input.notes ?? null,
      },
    });
    if (count === 0) throw notFound("Client");
  } catch (error) {
    if (isUniqueViolation(error)) throw duplicate();
    throw error;
  }
}

export async function deleteClient(ownerId: string, id: string) {
  const { count } = await db.client.deleteMany({ where: { id, ownerId } });
  if (count === 0) throw notFound("Client");
}

export async function getDashboardStats(ownerId: string) {
  const year = new Date().getUTCFullYear();
  const [total, thisYear, byStatus, recent] = await Promise.all([
    db.client.count({ where: { ownerId } }),
    db.client.count({ where: { ownerId, taxYear: { gte: year - 1 } } }),
    db.client.groupBy({
      by: ["filingStatus"],
      where: { ownerId },
      _count: { _all: true },
      orderBy: { filingStatus: "asc" },
    }),
    db.client.findMany({ where: { ownerId }, orderBy: { updatedAt: "desc" }, take: 5 }),
  ]);
  return {
    total,
    recentTaxYears: thisYear,
    byStatus: byStatus.map((s) => ({ status: s.filingStatus, count: s._count._all })),
    recent,
  };
}
