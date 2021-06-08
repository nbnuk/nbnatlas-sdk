import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import pkg from './package.json';
import { terser } from "rollup-plugin-terser";

const banner = `/* @preserve
 * A JS SDK for NBN Atlas. https://nbnatlas.org/
 * Author: Helen Manders-Jones helenmandersjones@gmail.com
 */
`;

const outro = `var oldNBNAtlas = window.NBNAtlas;
exports.noConflict = function() {
	window.NBNAtlas = oldNBNAtlas;
	return this;
}

/** @namespace NBNAtlas*/
window.NBNAtlas = exports;`;

export default [
	// browser-friendly UMD build
	{
		input: 'src/NBNAtlas.js',
		output: [{
			name: 'NBNAtlas',
			file: pkg.browser,
			format: 'umd',
			banner: banner,
			outro: outro
		},
		{
			name: 'NBNAtlas',
			file: pkg.browserMinimised,
			format: 'umd',
			plugins: [terser()],
			sourcemap: true,
			banner: banner,
			outro: outro
		}],
		plugins: [
			resolve(), 
			commonjs(), 
			
		]
	},
];
