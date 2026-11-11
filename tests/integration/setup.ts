import { afterAll, beforeEach } from "vitest";
import { TEST_DATABASE_URL } from "./env";

process.env.DATABASE_URL = TEST_DATABASE_URL;

const { db } = await import("@/server/db");

beforeEach(async () => {
  await db.$executeRawUnsafe(
    'TRUNCATE "Client", "Session", "LoginAttempt", "User" RESTART IDENTITY CASCADE',
  );
});

afterAll(async () => {
  await db.$disconnect();
});
