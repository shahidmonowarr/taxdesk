import "dotenv/config";

/** Integration tests run against their own database and never touch dev data. */
const url = process.env.TEST_DATABASE_URL;
if (!url) throw new Error("TEST_DATABASE_URL is not set. See .env.example.");
if (url === process.env.DATABASE_URL) {
  throw new Error("TEST_DATABASE_URL must differ from DATABASE_URL: the tests truncate every table.");
}
export const TEST_DATABASE_URL = url;
