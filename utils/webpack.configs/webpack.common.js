const path = require("path");
var DuplicatePackageCheckerPlugin = require("duplicate-package-checker-webpack-plugin");
const webpack = require("webpack");
const WebpackBuildNotifierPlugin = require("webpack-build-notifier");

module.exports = {
  plugins: [
    new DuplicatePackageCheckerPlugin(),
    new webpack.DefinePlugin({
      // Assuming built in EST
      BUILD_TIMESTAMP: '"' + new Date().toLocaleString() + " (EST)" + '"',
    }),
    // new webpack.ExtendedAPIPlugin()  // Gives hash as __webpack_hash__
    new WebpackBuildNotifierPlugin({
      //   title: "My Webpack Project",
      //   logo: path.resolve("./img/favicon.png"),
      suppressSuccess: true, // don't spam success notifications
      onComplete: function () {
        // Repalce VRMLWEBWORKER_FILENAME with the crrect file.
        const { exec } = require("child_process");

        function myExec(cmd) {
          return new Promise((resolve, reject) => {
            exec(cmd, (error, stdout, stderr) => {
              // if (error) { reject("error: " + cmd); }

              if (stderr) {
                reject("stderr: " + cmd + " >> " + stderr);
              }

              stdout = stdout.trim();

              // if (stdout === "") { reject("empty output: " + cmd); }

              resolve(stdout);
            });
          });
        }

        let filesWithReplacements = myExec(
          'grep -l "VRMLWEBWORKER_FILENAME" ./dist/*.js'
        );
        let webworkerFilename = myExec("ls ./dist/vrmlWebWorker*js");

        Promise.all([filesWithReplacements, webworkerFilename])
          .then((vals) => {
            let filesWithReplacements2 = vals[0];
            let webworkerFlNm = vals[1];

            filesWithReplacements2 = filesWithReplacements2
              .split("\n")
              .filter((f) => f.trim() !== "");
            webworkerFlNm = path.basename(webworkerFlNm);

            for (let fileWithReplacements of filesWithReplacements2) {
              console.log(
                "Replacing VRMLWEBWORKER_FILENAME in " + fileWithReplacements
              );
              let cmd = `cat ${fileWithReplacements} | sed "s/VRMLWEBWORKER_FILENAME/${webworkerFlNm}/g" > ${fileWithReplacements}.tmp; mv ${fileWithReplacements}.tmp ${fileWithReplacements}`;
              myExec(cmd);
            }
          })
          .catch((msg) => {
            console.log("fail: " + msg);
          });
      },
    }),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        options: { appendTsSuffixTo: [/\.vue$/] },
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    path: path.resolve(__dirname, "../../dist"),
  },
};
