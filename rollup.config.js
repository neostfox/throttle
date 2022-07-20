import resolve from "rollup-plugin-node-resolve";
import ts from "rollup-plugin-typescript";
export default {
	input: "src/index.ts",
	plugins: [resolve({ extensions: ["ts"] }), ts()],
	output: [
		{ dir: "lib/esm", format: "esm", sourcemap: true },
		{ dir: "lib/cjs", format: "cjs", sourcemap: true },
		{ dir: "lib/iife", format: "iife", sourcemap: true },
	],
};
