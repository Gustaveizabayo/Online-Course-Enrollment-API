import "dotenv/config";
import { defineConfig } from "@prisma/config";

export default defineConfig({
  schema: process.env.PRISMA_SCHEMA || "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
