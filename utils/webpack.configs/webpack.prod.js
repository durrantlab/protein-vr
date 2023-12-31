const webpack = require('webpack');
const merge = require('webpack-merge');
const webworker = require('./webpack.webworker.js');
const notWebworker = require('./webpack.not-webworker.js');
const path = require('path');
const ClosurePlugin = require('closure-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

// const MiniCssExtractPlugin = require('mini-css-extract-plugin');

console.log("webpack.prod.js");

let forProd = {
    mode: 'production',
    plugins: [
        // new MiniCssExtractPlugin({
        //     // Options similar to the same options in webpackOptions.output
        //     // all options are optional
        //     filename: '[name].css',
        //     chunkFilename: '[id].css',
        //     ignoreOrder: false, // Enable to remove warnings about conflicting order
        //   }),
        new webpack.optimize.ModuleConcatenationPlugin(),
        new BundleAnalyzerPlugin({
            // analyzerPort: 8889
            analyzerMode: "static"
        })
    ],
    optimization: {
        // sideEffects: false,
        // concatenateModules: false,
        minimizer: [
            new ClosurePlugin({
                mode: 'STANDARD', // 'AGGRESSIVE_BUNDLE', // 'STANDARD',
                platform: "java"
            }, {
                // debug: true,
                // renaming: false
                externs: [
                    path.resolve(__dirname, '../closure/custom_extern.js')
                ],
                compilation_level: 'ADVANCED',
                // formatting: 'PRETTY_PRINT',
            })
        ],

        // minimize: false,
        // minimizer: [
        //     new ClosureCompilerPlugin({
        //         mode: 'STANDARD', // a little misleading -- the actual compilation level is below
        //         childCompilations: true
        //     }, {
        //         externs: [path.resolve(__dirname, 'dist', 'externs.js')],
        //         languageOut: 'ECMASCRIPT5',
        //     })
        // ],
        // usedExports: true,
        // splitChunks: {
        //     minSize: 0
        // },
        // concatenateModules: true,


        // minimizer: [
        //     new ClosurePlugin({
        //         mode: 'STANDARD'
        //     }, {
        //         // compiler flags here
        //         //
        //         // for debuging help, try these:
        //         //
        //         // formatting: 'PRETTY_PRINT'
        //         // debug: true,
        //         // renaming: false
        //     })
        // ]
        splitChunks: { // Does NOT break webworker. Interesting...
            cacheGroups: {
                styles: {
                    // Only 1 CSS file.
                    name: 'styles',
                    test: /\.css$/,
                    chunks: 'all',
                    enforce: true,
                },
            },
        },
    }
}

// Webworker first!
let webworkerFinal = merge(webworker, forProd);
let nonWebworkerFinal = merge(notWebworker, forProd);

module.exports = [webworkerFinal, nonWebworkerFinal];
