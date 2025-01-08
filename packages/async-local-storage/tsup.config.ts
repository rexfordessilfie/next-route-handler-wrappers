import { defineConfig } from "tsup";

export default defineConfig({
  treeshake: true,
  dts: true,
  format: ["esm", "cjs"],
  entry: ["./src/index.ts", "./src/pagesapi/index.ts"],
});
