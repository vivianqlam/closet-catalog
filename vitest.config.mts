import { fileURLToPath } from "node:url";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

export default defineConfig(({ mode }) => ({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    include: ["tests/**/*.test.ts"],
    // Loads .env.local and .env.test.local (Supabase address + test accounts).
    env: loadEnv(mode, process.cwd(), ""),
    // The isolation test talks to the real Supabase database.
    testTimeout: 20_000,
  },
}));
