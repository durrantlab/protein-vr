const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');
var HtmlWebpackExcludeAssetsPlugin = require('html-webpack-exclude-assets-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');
// const {CleanWebpackPlugin} = require('clean-webpack-plugin');

module.exports = merge(common, {
    entry: {
        app: path.join(__dirname, '../../src/index.ts'),
    },
    plugins: [
        // new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            // title: 'Test Title',
            template: path.join(__dirname, '../../src/index.html'),
            // favicon: ???
            minify: true,
            excludeAssets: [/vrmlWebWorker.*.js/]
        }),
        new HtmlWebpackExcludeAssetsPlugin(),
        new webpack.ProvidePlugin({
            // For plugins that are not webpack-compatible.
            $: 'jquery',
            jQuery: 'jquery',
            "window.jQuery": "jquery",
            $3Dmol: '3dmol',
            "window.$3Dmol": '3dmol'
        }),
        new CopyWebpackPlugin([
            {from: 'src/babylon_scenes', to: 'babylon_scenes'},
            {from: 'src/js', to: 'js'},
            {from: 'src/components/UI/OpenPopup/pages', to: 'pages'},
            {from: 'src/components/Mols/3DMol/nanokid.sdf', to: 'nanokid.sdf'}
        ]),
    ],
    module: {
        rules: [
            {
                test: /\.css$/,
                include: path.join(__dirname, '../../src'),
                use: [
                    'style-loader',
                    {
                        loader: 'typings-for-css-modules-loader',
                        options: {
                            modules: true,
                            namedExport: true,
                            camelCase: true
                        }
                    }
                ]
            },
            { test: /\.(png|jpg|hdr|mp3|sdf)$/, loader: "file-loader" },
        ]
    },
    output: {
        chunkFilename: '[name].[hash].js',  // contenthash
        filename: "[name].[hash].js"  // contenthash
    },
    optimization: {
        // Below breaks webworker, because calls window from within it.
        // Really, we need separrate compiles for webworker and main.

        moduleIds: 'hashed',
        splitChunks: {
            chunks: 'all',
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    chunks: 'all'
                }
            }
        },
        runtimeChunk: 'single'
    }
});
