const path = require("path");
const webpack = require("webpack");
const nodeExternals = require("webpack-node-externals");
module.exports = {
  entry: {
    server: "./api/server.js",
  },

  devServer: {
    port: 4200,
    clientLogLevel: "info",
    // headers: {
    //   "Access-Control-Allow-Origin": "*",
    //   "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
    //   "Access-Control-Allow-Headers":
    //     "X-Requested-With, content-type, Authorization, x-access-token",
    // },
  },
  output: {
    path: path.join(__dirname, ""),
    publicPath: "/",
    filename: "server-build.js",
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
