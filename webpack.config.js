const path = require("path");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

module.exports = {
  entry: "./src/js/ethers.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "./dist"),
  },
  mode: 'development',
  plugins: [new NodePolyfillPlugin()],
  devServer: {
    static: {
      directory: path.resolve(__dirname, "./dist"),
    },
    port: 3000,
  },
  resolve: {
    fallback: {
      url: require.resolve("url/"),
      fs: false,
      tls: false,
      net: false,
    },
  },
};
