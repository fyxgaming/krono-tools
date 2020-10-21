import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import tsPlugin from '@rollup/plugin-typescript';
import typescript from 'typescript';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
import sveltePreprocess from 'svelte-preprocess';
import externalGlobals from "rollup-plugin-external-globals";
import { wasm } from '@rollup/plugin-wasm';
import json from '@rollup/plugin-json';
// import builtins from 'rollup-plugin-node-builtins';
// import globals from 'rollup-plugin-node-globals';
import nodePolyfills from 'rollup-plugin-node-polyfills';


const production = !process.env.ROLLUP_WATCH;

function serve() {
	let server;

	function toExit() {
		if (server) server.kill(0);
	}

	return {
		writeBundle() {
			if (server) return;
			server = require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
				stdio: ['ignore', 'inherit', 'inherit'],
				shell: true
			});

			process.on('SIGTERM', toExit);
			process.on('exit', toExit);
		}
	};
}

export default {
	input: 'src/main.ts',
	output: {
		sourcemap: true,
		format: 'iife',
		name: 'wallet',
		file: 'public/build/bundle.js',
		globals: {
			bsv: 'bsvjs',
			'@kronoverse/run': 'Run',
			'argon2-browser': 'argon2'
		}
	},
	external: ['bsv', '@kronoverse/run'],
	watch: {
		include: 'src/**'
    },
	plugins: [
		nodePolyfills(),
		// globals(),
		// builtins(),
		json(),
		wasm(),
		externalGlobals({
			'@kronoverse/run': 'Run',
			'argon2-browser': 'argon2'
		}),
		// If you have external dependencies installed from
		// npm, you'll most likely need these plugins. In
		// some cases you'll need additional configuration -
		// consult the documentation for details:
		// https://github.com/rollup/plugins/tree/master/packages/commonjs
		resolve({
			browser: true,
			dedupe: ['svelte'],
			preferBuiltins: true
		}),
		svelte({
			// enable run-time checks when not in production
			dev: !production,
			// we'll extract any component CSS out into
			// a separate file - better for performance
			css: css => {
				css.write('bundle.css');
			},
			preprocess: sveltePreprocess(),
		}),
		tsPlugin({
			sourceMap: !production,
			inlineSources: !production,
			moduleResolution: "node",
			typescript: typescript,
		}),
		commonjs(),
		copy({
			targets: [
				{ src: '../node_modules/@kronoverse/run/dist/run.browser.min.js', dest: 'public' },
				{ src: '../node_modules/@kronoverse/run/dist/bsv.browser.min.js', dest: 'public' },
				// { src: './node_modules/argon2-browser/lib/argon2.js', dest: 'public/build' },
				// { src: './node_modules/argon2-browser/dist/argon2.js', dest: 'public/dist' },
				// { src: './node_modules/argon2-browser/dist/argon2.wasm', dest: 'public/node_modules/argon2-browser/dist' },
			]
		}),
		// In dev mode, call `npm run start` once
		// the bundle has been generated
		!production && serve(),

		// Watch the `public` directory and refresh the
		// browser on changes when not in production
		!production && livereload('public'),

		// If we're building for production (npm run build
		// instead of npm run dev), minify
		production && terser()
	],
	watch: {
		clearScreen: false
	}
};
