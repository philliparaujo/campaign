const { context } = require("esbuild");
const path = require("path");
const { exec } = require("child_process");

const outfile = path.resolve(__dirname, "dist", "bundle.js");

const ctx = context({
  entryPoints: ["./src/index.ts"], // Entry point of your application
  bundle: true, // Bundle all dependencies
  platform: "node", // Target Node.js (instead of browser)
  target: "es2020", // Target ECMAScript 2020 to support BigInt
  outfile: outfile, // Output file
  external: ["node_modules/*"], // Exclude node_modules from the bundle
}).catch(() => process.exit(1));

function startNode() {
  const nodeProcess = exec(`node ${outfile}`);

  nodeProcess.stdout.on("data", (data) => {
    console.log(data);
  });

  nodeProcess.stderr.on("data", (data) => {
    console.error(data);
  });

  nodeProcess.on("close", (code) => {
    console.log(`Node.js process exited with code ${code}`);
  });
}

if (process.argv[2] === "--dev") {
  ctx.then((ctx) => {
    ctx.rebuild().then(() => {
      startNode();
    });
  });
} else {
  ctx.then((ctx) => {
    ctx.rebuild();
    ctx.dispose();
  });
}
