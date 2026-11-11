import "dotenv/config";
import { defineConfig } from "prisma/config";

// Migrations need a direct (unpooled) connection on Neon; the app itself uses
// the pooled DATABASE_URL through the driver adapter in src/server/db.ts.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  },
});
