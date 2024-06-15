import type { Config } from "drizzle-kit";

export default {
  dialect: "sqlite",
  schema: "./database/tables/*",
  out: "./database/migrations",
  driver: "d1-http",
} satisfies Config;
