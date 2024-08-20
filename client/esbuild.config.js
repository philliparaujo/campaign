const { context } = require("esbuild");
const fs = require("fs");
const path = require("path");
const http = require("http");

const apiPort = 5000;
const buildTime = new Date().toUTCString();

const generateIndexHtmlPlugin = {
  name: "generate-html-plugin",
  setup(build) {
    build.onEnd(() => {
      console.log("Generating index.html");
      const indexHtml = fs
        .readFileSync("index.html")
        .toString()
        .replaceAll("{{NOW}}", Date.now());
      fs.writeFileSync(path.join("dist", "index.html"), indexHtml);
    });
  },
};

const ctx = context({
  entryPoints: ["./src/index.tsx"], // Entry point of your React app
  bundle: true, // Bundle all dependencies into one output file
  outfile: "./dist/index.js", // Output file
  loader: {
    ".js": "jsx", // Use 'jsx' loader for JavaScript files
    ".tsx": "tsx", // Use 'tsx' loader for TypeScript files
    ".ts": "ts", // Use 'ts' loader for TypeScript files
    ".jpg": "file", // Use 'file' loader for image files
  },
  define: {
    "process.env.NODE_ENV": '"production"', // Set environment variable for production
    "process.env.BUILD_TIME": `"${buildTime}"`,
  },
  plugins: [generateIndexHtmlPlugin],
  minify: true, // Minify the output for smaller file size
  sourcemap: true, // Generate source maps for easier debugging
  target: ["es2020"], // Set the target to modern JavaScript
}).catch(() => process.exit(1));

if (process.argv[2] === "--dev") {
  ctx.then(async (ctx) => {
    await ctx.watch();

    ctx
      .serve({
        host: "127.0.0.1",
        port: 3001,
        servedir: "./dist",
        fallback: path.join("./dist", "index.html"),
        onRequest: (args) => {
          console.log("received request for ", args.path);
        },
      })
      .then(({ host, port: serverPort }) => {
        http
          .createServer((req, res) => {
            console.log("received request for req ", req.url);

            let options = {
              hostname: host,
              port: serverPort,
              path: req.url,
              method: req.method,
              headers: req.headers,
            };

            if (req.url.startsWith("/api")) {
              options = {
                ...options,
                port: apiPort,
              };
            }

            const proxyReq = http.request(options, (proxyRes) => {
              res.writeHead(proxyRes.statusCode, proxyRes.headers);
              proxyRes.pipe(res, {
                end: true,
              });
            });

            proxyReq.on("error", (e) => {
              console.error(e);
              res.writeHead(500);
              res.end("Proxy request error");
            });

            req.pipe(proxyReq, {
              end: true,
            });
          })
          .listen(3000, () => {
            console.log("Proxy server running on http://127.0.0.1:3000");
          });
      })
      .catch((err) => {
        console.error(err);
        process.exit(1);
      });
  });
} else {
  ctx.then((ctx) => {
    ctx.rebuild();
    ctx.dispose();
  });
}
