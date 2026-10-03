import { defineConfig } from "vitest/config";

export default defineConfig({
  // Never load local credentials or the application's env files in tests.
  envDir: false,
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    setupFiles: ["./tests/setup.ts"],
    clearMocks: true,
    restoreMocks: true,
    unstubEnvs: true,
  },
});
