import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import typescriptLib from 'typescript';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
import sveltePreprocess from 'svelte-preprocess';
import externalGlobals from "rollup-plugin-external-globals";
import { wasm } from '@rollup/plugin-wasm';
import json from '@rollup/plugin-json';
import nodePolyfills from 'rollup-plugin-node-polyfills';

//POPULATED WHEN `rollup -c -w` IS RUN (i.e. "-w") 
const production = !process.env.ROLLUP_WATCH;

export default {
	input: 'src/main.ts',
	output: {
		sourcemap: !production,
		format: 'iife',
		name: 'wallet',
		file: 'public/build/bundle.js',
		globals: {
			'bsv': 'bsvjs',
			'@kronoverse/run': 'Run',
			'argon2-browser': 'argon2'
		}
	},
	external: ['bsv', '@kronoverse/run'],
	watch: {
		include: [
			'src/**',
			'public/global.css',
			'public/index.html'
		],
		clearScreen: true,
	},
	plugins: [
		nodePolyfills(),
		json(),
		wasm(),
		externalGlobals({
			'@kronoverse/run': 'Run',
			'argon2-browser': 'argon2'
		}),
		copy({
			flatten: false,
			targets: [
				{ src: '../node_modules/@kronoverse/run/dist/run.browser.min.js', dest: 'public' },
				{ src: '../node_modules/@kronoverse/run/dist/bsv.browser.min.js', dest: 'public' },
				{ src: './node_modules/argon2-browser/lib/argon2.js', dest: 'public/build' },
				{ src: './node_modules/argon2-browser/dist/argon2.js', dest: 'public/dist' },
				{ src: './node_modules/argon2-browser/dist/argon2.wasm', dest: 'public/node_modules/argon2-browser/dist' },
			]
		}),
		typescript({
			sourceMap: !production,
			inlineSources: !production,
			moduleResolution: "node",
			typescript: typescriptLib,
			noEmitOnError: true,
		}),
		commonjs(),
		svelte({
			dev: !production,
			extensions: ['.svelte'],
			css: css => {
				css.write('bundle.css');
			},
			preprocess: sveltePreprocess(),
		}),
		resolve({
			browser: true,
			dedupe: ['svelte'],
			preferBuiltins: true
		}),
		!production && livereload('public'), /* livereload when changes detected inside public */
		!production && serve(), /* start dev server */
		production && terser() /* minify for prod */
	]
};

function wait(ms) {
	let waitDateOne = new Date();
	while ((new Date()) - waitDateOne <= ms) {
		//nothing
	}
}

function serve() {
	let childProcess;

	function exitor(name) {
		return (code, signal) => {
			console.log(`On${name} CHECK FOR CHILD PROCESS`);
			console.log(`CODE:${code}`);
			console.log(`SIGNAL:${signal})`);
			if (childProcess && childProcess.kill(0)) {
				const pid = childProcess.pid;
				console.log(`CLEANUP CHILD PROCESS: ${pid}`);
				childProcess.kill('SIGINT');
				if (process.env.CHILD_PROCESS_ID == pid) {
					process.env.CHILD_PROCESS_ID = 0;
				}
			}
			childProcess = null;
			wait(5000);
		}
	}

	//RETURN ROLLUP PLUGIN API
	return {
		writeBundle() {
			if (process.env.CHILD_PROCESS_ID) {
				//PASSING 0 DOESN'T KILL THE PROCESS
				const running = process.kill(process.env.CHILD_PROCESS_ID, 0);
				if (running) {
					console.log(`SERVER ALREADY RUNNING`);
					return;
					// UNCOMMENT THE FOLLOWING LINES TO RESTART SERVER EVERY TIME
					// console.log(`KILLING OLD CHILD PROCESS: ${process.env.CHILD_PROCESS_ID}`);
					// process.kill(process.env.CHILD_PROCESS_ID);
					// process.env.CHILD_PROCESS_ID = 0;
					// ALLOW A COUPLE SECONDS TO FREE UP PORT 5000
					// wait(5000);
				}
				process.env.CHILD_PROCESS_ID = 0;
			}
			console.log('START SERVER');
			wait(1000); 
			//RUN `npm start -- --dev` i.e., `sirv public --dev`
			const { spawn } = require('child_process');
			const args = ['run', 'start', '--', '--dev'];
			childProcess = spawn('npm', args, {
				stdio: ['ignore', 'inherit', 'inherit'],
				shell: true
			});

			console.log(`SERVER PROCESS: ${childProcess.pid}`);
			process.env.CHILD_PROCESS_ID = childProcess.pid;

			//ATTACH TO TERMINATION EVENTS FOR CLEANUP
			childProcess.on('SIGTERM', exitor('SIGTERM'));
			childProcess.on('exit', exitor('exit'));
			childProcess.on('close', exitor('close'));

			console.log('FINISHED STARTING SERVER');
		}
	};
}
