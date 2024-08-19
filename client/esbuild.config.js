const {context} = require('esbuild');
const fs = require('fs');
const path = require('path');

const copyStaticFiles = {
  name: 'copy-static-files',
  setup(build) {
    build.onEnd(() => {
      const source = path.join(__dirname, 'index.html');
      const destination = path.join(__dirname, 'dist/index.html');

      fs.copyFileSync(source, destination);
      console.log('index.html copied to dist/');
    });
  }
};

const ctx = context({
  entryPoints: ['./src/index.tsx'], // Entry point of your React app
  bundle: true, // Bundle all dependencies into one output file
  outfile: './dist/index.js', // Output file
  loader: {
    '.js': 'jsx', // Use 'jsx' loader for JavaScript files
    '.tsx': 'tsx', // Use 'tsx' loader for TypeScript files
    '.ts': 'ts', // Use 'ts' loader for TypeScript files
  },
  define: {
    'process.env.NODE_ENV': '"production"' // Set environment variable for production
  },
  plugins: [copyStaticFiles],
  minify: true, // Minify the output for smaller file size
  sourcemap: true, // Generate source maps for easier debugging
  target: ['es2020'], // Set the target to modern JavaScript
}).catch(() => process.exit(1));

if (process.argv[2] === '--dev') {
    ctx.then(ctx => {
        ctx.serve({
            host: '127.0.0.1',
            port: 3000,
            servedir: './dist',
        });
    })
  } else {
    ctx.then(ctx => {
      ctx.rebuild();
      ctx.dispose();
    });
  }

