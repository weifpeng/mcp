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
  dts: true,
  noExternal: ["@tokenpocket/trpc"],
  esbuildOptions(options) {
    options.target = "es2020";
    options.platform = "node";
  },
});
