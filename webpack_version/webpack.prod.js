const merge = require('webpack-merge');
const common = require('./webpack.common.js');
// const MiniCssExtractPlugin = require('mini-css-extract-plugin');

// const ClosurePlugin = require('closure-webpack-plugin');

module.exports = merge(common, {
    mode: 'production',
    output: {
        filename: '[name].[chunkhash].js'
    },
    plugins: [
        // new MiniCssExtractPlugin({
        //     // Options similar to the same options in webpackOptions.output
        //     // all options are optional
        //     filename: '[name].css',
        //     chunkFilename: '[id].css',
        //     ignoreOrder: false, // Enable to remove warnings about conflicting order
        //   }),
    ],
    optimization: {
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
        splitChunks: {
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
