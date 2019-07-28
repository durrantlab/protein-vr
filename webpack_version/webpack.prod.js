const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const ClosurePlugin = require('closure-webpack-plugin');

// const MiniCssExtractPlugin = require('mini-css-extract-plugin');

// const ClosurePlugin = require('closure-webpack-plugin');

module.exports = merge(common, {
    mode: 'production',
    plugins: [
        // new MiniCssExtractPlugin({
        //     // Options similar to the same options in webpackOptions.output
        //     // all options are optional
        //     filename: '[name].css',
        //     chunkFilename: '[id].css',
        //     ignoreOrder: false, // Enable to remove warnings about conflicting order
        //   }),
        new webpack.optimize.ModuleConcatenationPlugin()
    ],
    optimization: {
        // sideEffects: false,
        // concatenateModules: false,
        // minimizer: [
        //     new ClosurePlugin({
        //         mode: 'AGGRESSIVE_BUNDLE', // 'STANDARD',
        //         platform: "java"
        //     }, {
        //         // compiler flags here
        //         //
        //         // for debuging help, try these:
        //         //
        //         // formatting: 'PRETTY_PRINT'
        //         // debug: true,
        //         // renaming: false
        //         // compilation_level: 'ADVANCED',
        //         formatting: 'PRETTY_PRINT',
        //         //
        //     })
        // ],

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
});
