import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: "esm",
  target: "node18",
  outDir: "dist",
  bundle: true,
  clean: true,
  splitting: false,
  shims: true,
  dts: false,
  noExternal: ["@tokenpocket/trpc"],
  banner: {
    js: "#!/usr/bin/env node",
  },
});
