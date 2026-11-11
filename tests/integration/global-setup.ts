import { execSync } from "node:child_process";
import { TEST_DATABASE_URL } from "./env";

/** Bring the test database to the latest schema once per run. */
export default function setup() {
  execSync("npx prisma migrate deploy", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL, DIRECT_URL: TEST_DATABASE_URL },
  });
}
