
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import strip from '@rollup/plugin-strip';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const pkg = require('./package.json'); 

const 
	prod = (process.env?.NODE_ENV === 'production'),
	config = [],
	outputPlugins = [];

if (prod) {
	outputPlugins.push(terser({
		format: {
			preamble: `/* ${pkg.name} v${pkg.version}\n${pkg.homepage} */`
		}
	}));
}

config.push({	
	// ESM without debug.
	input: './index.js',
	plugins: [
		resolve(),
		strip({
			functions: ['debug', 'makeDebug']
		})
	],
	external: ['debug'],
	treeshake: {
		moduleSideEffects: false
	},
	output: {
		file: `./browser/conditional-tag${prod ? '.min' : ''}.js`,
		format: 'es',
		plugins: outputPlugins
	}
});

if (!prod) {
	config.push({
		// ESM with debug (browser version) integrated.
		input: './index.js',
		plugins: [
			commonjs(),
			resolve({ 
				browser: true 
			})
		],
		output: {
			file: `./browser/conditional-tag.debug${prod ? '.min' : ''}.js`,
			format: 'es',
			plugins: outputPlugins,
			sourcemap: 'inline'
		}
	});
}

export default config;
