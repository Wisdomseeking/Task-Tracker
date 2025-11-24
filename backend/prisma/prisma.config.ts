import { defineConfig } from "@prisma/adapter-node-postgres";
import { PrismaPostgreSQL } from "@prisma/adapter-postgresql";

export default defineConfig({
  datasources: {
    db: {
      url: process.env.DATABASE_URL!,
    },
  },
});
