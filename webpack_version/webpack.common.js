const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
var DuplicatePackageCheckerPlugin = require("duplicate-package-checker-webpack-plugin");
const webpack = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var HtmlWebpackExcludeAssetsPlugin = require('html-webpack-exclude-assets-plugin');

module.exports = {
    entry: {
        vrmlWebWorker: './src/components/Mols/3DMol/VRMLParser.worker.ts',
        app: './src/index.ts'
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            // title: 'Test Title',
            template: path.join(__dirname, 'src/index.html'),
            // favicon: ???
            minify: true,
            excludeAssets: [/vrmlWebWorker.*.js/]
        }),
        new HtmlWebpackExcludeAssetsPlugin(),
        new DuplicatePackageCheckerPlugin(),
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
            {from: 'src/components/UI/OpenPopup/pages', to: 'pages'}
        ]),
        new webpack.ExtendedAPIPlugin()  // Gives hash as __webpack_hash__
    ],
    module: {
        rules: [
            { test: /\.tsx?$/, loader: "ts-loader" },
            // {
            //     test: /\.tsx?$/,
            //     exclude: /node_modules/,
            //     // use: ,
            //     use: {
            //         loader: "ts-loader"
            //         // options: {
            //         //     compilerOptions: {
            //         //         module: "es6",
            //         //         // allowSyntheticDefaultImports: true,
            //         //     },
            //             // transpileOnly: true,
            //             // configFile: "./tsconfig.json",
            //             // allowTsInNodeModules: true,
            //         // }
            //     }
            // },
            {
                test: /\.css$/,
                include: path.join(__dirname, 'src'),
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
            // {
            //     test: /\.worker\.ts$/,
            //     use: {
            //         loader: 'worker-loader',
            //         options: { inline: true }
            //     }
            // },
            // {
            //     test: /\.(png|svg|jpg|gif)$/,
            //     use: [
            //         'file-loader'
            //     ]
            // },
            { test: /\.(png|jpg|hdr|mp3|sdf)$/, loader: "file-loader" },
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    output: {
        filename: "[name].[hash].js",
        // chunkFilename: '[name].[hash].js',
        path: path.resolve(__dirname, 'dist')
    },
    optimization: {
        // Below breaks webworker, because calls window from within it.
        // Really, we need separrate compiles for webworker and main.

        // moduleIds: 'hashed',
        // splitChunks: {
        //     chunks: 'all',
        //     cacheGroups: {
        //         vendor: {
        //             test: /[\\/]node_modules[\\/]/,
        //             name: 'vendors',
        //             chunks: 'all'
        //         }
        //     }
        // },
        // runtimeChunk: 'single'
    }
};
