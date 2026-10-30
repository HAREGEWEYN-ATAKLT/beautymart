import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",

  migrations: {
    path: "prisma/migrations",
  },

  datasource: {
    // Production uses a direct database URL for Prisma CLI migrations and a
    // pooled DATABASE_URL for the serverless application. Local development
    // needs only DATABASE_URL, so it remains the safe fallback.
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
});
