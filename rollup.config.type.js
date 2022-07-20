
import dts from 'rollup-plugin-dts';

export default {
	input: "src/index.ts",
	plugins: [dts()],
	output: [
		{
			format: 'esm', file: 'lib/esm/index.d.ts',
		},
		{ file: "lib/cjs/index.d.ts", format: "cjs" },
		{ file: "lib/iife/index.d.ts", format: "iife" },
	],
}
