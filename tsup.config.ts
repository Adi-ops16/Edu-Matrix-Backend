import { defineConfig } from "tsup";

export default defineConfig({
	// Entry point(s) of your application or library
	entry: ["src/server.ts"],

	// Output formats: ESM and CommonJS
	format: ["esm"],

	// Generate TypeScript declaration files (.d.ts)
	dts: false,

	// Clean the output directory (dist) before every build
	clean: true,

	// Generate source maps for easier debugging
	sourcemap: true,

	// Minify production output (optional)
	minify: false,

	// Target environment (e.g., 'node' or 'browser')
	platform: "node",

	// Automatically split code chunks if necessary
	splitting: false,
});
