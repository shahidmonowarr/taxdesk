import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "@node-rs/argon2";
import { PrismaClient } from "../src/generated/prisma/client";

// Dummy accounts only. Idempotent: safe to run on every deploy or test run.
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

const USERS = [
  { email: "demo@taxdesk.dev", password: "DemoPass2026", name: "Dana Preparer", role: "PREPARER" },
  { email: "admin@taxdesk.dev", password: "AdminPass2026", name: "Avi Admin", role: "ADMIN" },
] as const;

async function main() {
  for (const u of USERS) {
    await db.user.upsert({
      where: { email: u.email },
      update: {},
      create: { email: u.email, name: u.name, role: u.role, passwordHash: await hash(u.password) },
    });
  }
  console.log(`Seeded ${USERS.length} users.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
