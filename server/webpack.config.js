const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  mode: 'development', // or 'production' for a production build
  target: 'node', // Ensures that Webpack compiles for Node.js
  entry: './src/index.ts', // The entry point of your application
  output: {
    filename: 'bundle.js', // The output bundle file
    path: path.resolve(__dirname, 'dist'), // The output directory
  },
  resolve: {
    extensions: ['.ts', '.js'], // Resolve these extensions
  },
  module: {
    rules: [
      {
        test: /\.ts$/, // Matches .ts files
        use: 'ts-loader', // Uses ts-loader to transpile TypeScript
        exclude: /node_modules/, // Exclude dependencies in node_modules
      },
    ],
  },
};
