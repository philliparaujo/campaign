const { build } = require('esbuild');
const path = require('path');

build({
  entryPoints: ['./src/index.ts'], // Entry point of your application
  bundle: true, // Bundle all dependencies
  platform: 'node', // Target Node.js (instead of browser)
  target: 'es2020', // Target ECMAScript 2020 to support BigInt
  outfile: path.resolve(__dirname, 'dist', 'bundle.js'), // Output file
  external: ['node_modules/*'], // Exclude node_modules from the bundle
}).catch(() => process.exit(1));
