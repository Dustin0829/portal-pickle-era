import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { boneyardPlugin } from "boneyard-js/vite";
import { defineConfig } from "vitest/config";

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  server: { port: 5174 },
  plugins: [
    react(),
    tailwindcss(),
    command === "serve" && boneyardPlugin({ out: "./src/bones" }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: false,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/test/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      include: ["src/lib/**", "src/api/schema/**", "src/api/features/**"],
      exclude: [
        "src/test/**",
        "src/**/*.{test,spec}.{ts,tsx}",
        "**/*.types.ts",
        "src/**/index.ts",
      ],
    },
  },
}));
