const path = require("path");
const nodeExternals = require("webpack-node-externals");
module.exports = {
  entry: {
    server: "./api/server.js",
  },
  mode: "production",
  output: {
    path: path.join(__dirname, ""),
    publicPath: "/",
    filename: "server.js",
  },
  target: "node",
  node: {
    __dirname: false,
    __filename: false,
  },
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
    ],
  },
};
