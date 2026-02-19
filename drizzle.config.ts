// Config file for Drizzle ORM

import { defineConfig } from "drizzle-kit";
import { readConfig } from "src/config.js";

export default defineConfig({
    schema: "src/db/schema.ts",
    out: "src/db/",
    dialect: "postgresql",
    dbCredentials: {
        url: "postgres://postgres:rastervector@localhost:5432/gator?sslmode=disable",
    },
});
