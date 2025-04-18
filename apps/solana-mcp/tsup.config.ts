import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: "cjs",
  target: "node18",
  outDir: "dist",
  bundle: true,
  clean: true,
  splitting: false,
  shims: true,
  dts: false,
  noExternal: ["@tokenpocket/solana", "@tokenpocket/trpc"],
  banner: {
    js: "#!/usr/bin/env node",
  },
});
