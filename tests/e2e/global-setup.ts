import { execSync } from "node:child_process";
import { Client } from "pg";

/**
 * Latest schema + known seed data in the test database before the browser
 * suite. Truncates rather than `migrate reset`: same result, no schema drop.
 */
export default async function globalSetup() {
  if (process.env.E2E_BASE_URL) return; // remote demo: its own data, never reset it
  const url = process.env.TEST_DATABASE_URL;
  if (!url) throw new Error("TEST_DATABASE_URL is not set. See .env.example.");
  if (url === process.env.DATABASE_URL) throw new Error("TEST_DATABASE_URL must differ from DATABASE_URL.");

  const env = { ...process.env, DATABASE_URL: url, DIRECT_URL: url };
  execSync("npx prisma migrate deploy", { stdio: "inherit", env });

  const pg = new Client({ connectionString: url });
  await pg.connect();
  await pg.query('TRUNCATE "Client", "Session", "LoginAttempt", "User" RESTART IDENTITY CASCADE');
  await pg.end();

  execSync("npx prisma db seed", { stdio: "inherit", env });
}
