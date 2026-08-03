import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dbCredentials: {
    url: "postgresql://neondb_owner:npg_m9Sineuka7sf@ep-wild-scene-a2vw3u1f.eu-central-1.aws.neon.tech/neondb?sslmode=require",
  },
  dialect: "postgresql",
  out: "./lib/db/migrations",
  schema: "./lib/db/schema.ts",
});