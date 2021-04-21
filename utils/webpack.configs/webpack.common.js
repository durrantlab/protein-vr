const path = require('path');
var DuplicatePackageCheckerPlugin = require("duplicate-package-checker-webpack-plugin");
const webpack = require('webpack');

module.exports = {
    plugins: [
        new DuplicatePackageCheckerPlugin(),
        new webpack.DefinePlugin({
            // Assuming built in EST
            BUILD_TIMESTAMP: '"' + new Date().toLocaleString() + " (EST)" + '"'
        })
        // new webpack.ExtendedAPIPlugin()  // Gives hash as __webpack_hash__
    ],
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader",
                options: { appendTsSuffixTo: [/\.vue$/] }
            }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    output: {
        path: path.resolve(__dirname, '../../dist')
    }
};
