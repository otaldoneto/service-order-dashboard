import { defineConfig } from "vitest/config";

export default defineConfig({
  // Understands the "@/..." imports configured in tsconfig.json
  resolve: { tsconfigPaths: true },
  test: {
    // The API client runs on the server, so its tests run in Node (no browser DOM needed)
    environment: "node",
    include: ["src/**/*.test.ts"],
    // Every test starts with a clean fetch mock and clean environment variables
    restoreMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,
  },
});