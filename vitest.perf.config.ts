import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

/**
 * Config for the measurement harnesses (`*.perf.ts`), run via
 * `npm run measure:voxel`.
 *
 * Kept separate from the main config on purpose: these build the whole scene and
 * take ~15s, which is far too slow to sit in the test gate, but they are the only
 * way to get NUMBERS out of the build rather than opinions about screenshots.
 */
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: ["./test/setup.ts"],
    include: ["**/*.perf.ts"],
    testTimeout: 120_000,
  },
  resolve: {
    alias: { "@": resolve(__dirname, ".") },
  },
});
