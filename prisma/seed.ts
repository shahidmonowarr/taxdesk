import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "@node-rs/argon2";
import { PrismaClient, type FilingStatus } from "../src/generated/prisma/client";

// Dummy data only. Idempotent: safe to run on every deploy or test run.
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

export const DEMO = { email: "demo@taxdesk.dev", password: "DemoPass2026", name: "Dana Preparer" };
const OTHER = { email: "other@taxdesk.dev", password: "OtherPass2026", name: "Omar Other" };

const year = new Date().getUTCFullYear() - 1;
const clients: { firstName: string; lastName: string; email: string; taxYear: number; filingStatus: FilingStatus; phone?: string; ssnLast4?: string; notes?: string }[] = [
  { firstName: "Maria", lastName: "Garcia", email: "maria.garcia@example.com", taxYear: year, filingStatus: "MARRIED_JOINT", phone: "+1 555 010 2030", ssnLast4: "4821", notes: "W-2 and 1099-INT expected." },
  { firstName: "James", lastName: "Chen", email: "james.chen@example.com", taxYear: year, filingStatus: "SINGLE", ssnLast4: "1177" },
  { firstName: "Aisha", lastName: "Rahman", email: "aisha.rahman@example.com", taxYear: year, filingStatus: "HEAD_OF_HOUSEHOLD", phone: "+1 555 010 7781", notes: "Two dependents." },
  { firstName: "Noah", lastName: "Levi", email: "noah.levi@example.com", taxYear: year, filingStatus: "MARRIED_SEPARATE", notes: "Lives abroad; FBAR may apply." },
  { firstName: "Emily", lastName: "Brooks", email: "emily.brooks@example.com", taxYear: year - 1, filingStatus: "SINGLE" },
  { firstName: "Robert", lastName: "King", email: "robert.king@example.com", taxYear: year - 1, filingStatus: "QUALIFYING_SURVIVING_SPOUSE" },
];

async function upsertUser(u: typeof DEMO) {
  return db.user.upsert({
    where: { email: u.email },
    update: {},
    create: { email: u.email, name: u.name, passwordHash: await hash(u.password) },
  });
}

async function main() {
  const demo = await upsertUser(DEMO);
  const other = await upsertUser(OTHER);

  for (const c of clients) {
    await db.client.upsert({
      where: { ownerId_email_taxYear: { ownerId: demo.id, email: c.email, taxYear: c.taxYear } },
      update: {},
      create: { ...c, ownerId: demo.id },
    });
  }
  // Belongs to another user: must never appear in the demo account.
  await db.client.upsert({
    where: { ownerId_email_taxYear: { ownerId: other.id, email: "private@example.com", taxYear: year } },
    update: {},
    create: { ownerId: other.id, firstName: "Private", lastName: "Record", email: "private@example.com", taxYear: year, filingStatus: "SINGLE" },
  });

  console.log(`Seeded ${clients.length + 1} clients for 2 users.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
