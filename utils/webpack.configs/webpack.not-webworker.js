const webpack = require("webpack");
const merge = require("webpack-merge");
const common = require("./webpack.common.js");
const HtmlWebpackPlugin = require("html-webpack-plugin");
var HtmlWebpackExcludeAssetsPlugin = require("html-webpack-exclude-assets-plugin");
var CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");
const WorkboxPlugin = require("workbox-webpack-plugin"); // for PWA
// const {CleanWebpackPlugin} = require('clean-webpack-plugin');

module.exports = merge(common, {
    entry: {
        app: path.join(__dirname, "../../src/index.ts")
    },
    plugins: [
        // new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            // title: 'Test Title',
            template: path.join(__dirname, "../../src/index.html"),
            // favicon: ???
            minify: true,
            excludeAssets: [/vrmlWebWorker.*.js/]
        }),
        new HtmlWebpackExcludeAssetsPlugin(),
        new webpack.ProvidePlugin({
            // For plugins that are not webpack-compatible.
            $: "jquery",
            jQuery: "jquery",
            "window.jQuery": "jquery",
            $3Dmol: "3dmol",
            "window.$3Dmol": "3dmol",
            // bootstrap: "bootstrap",
            // "window.bootstrap": "bootstrap"
        }),
        new CopyWebpackPlugin([
            { from: "src/babylon_scenes", to: "environs" },
            { from: "src/js", to: "js" },
            { from: "src/components/UI/OpenPopup/pages", to: "pages" },
            {
                from: "src/components/Mols/3DMol/nanokid.sdf",
                to: "nanokid.sdf"
            },
            { from: "src/pwa/icon-192.png", to: "icon-192.png" },
            { from: "src/pwa/icon-256.png", to: "icon-256.png" },
            { from: "src/pwa/icon-512.png", to: "icon-512.png" },
            { from: "src/pwa/icon-1024.png", to: "icon-1024.png" },
            {
                from: "src/pwa/manifest.webmanifest",
                to: "manifest.webmanifest"
            },
            { from: "src/styles/style.css", to: "style.css" },
            { from: "src/styles/favicon.ico", to: "favicon.ico" }
        ]),
        new WorkboxPlugin.GenerateSW({
            // These options encourage the ServiceWorkers to get in there fast
            // and not allow any straggling "old" SWs to hang around. See
            // https://webpack.js.org/guides/progressive-web-application/
            clientsClaim: true,
            skipWaiting: true,
            // swDest: 'sw.js'
            runtimeCaching: [
                {
                    urlPattern: /\./,
                    handler: "NetworkFirst" // First check the network. If that fails, use cache...
                }
            ]
        })
    ],
    module: {
        rules: [
            {
                test: /\.css$/,
                include: path.join(__dirname, "../../src"),
                use: [
                    "style-loader",
                    {
                        loader: "typings-for-css-modules-loader",
                        options: {
                            modules: true,
                            namedExport: true,
                            camelCase: true
                        }
                    }
                ]
            },
            { test: /\.(png|jpg|hdr|mp3|sdf)$/, loader: "file-loader" },
            // {
            //     test: require.resolve("jquery"),
            //     use: [
            //         {
            //             loader: "expose-loader",
            //             options: "jQuery"
            //         },
            //         {
            //             loader: "expose-loader",
            //             options: "$"
            //         }
            //     ]
            // },
            // {
            //     test: require.resolve("bootstrap"),
            //     use: [
            //         {
            //             loader: "expose-loader",
            //             options: "bootstrap"
            //         },
            //     ]
            // }
        ]
    },
    output: {
        // No longer using hashes. Because google closure compiler makes
        // copies of files, which then get passed to service worker manifest,
        // causing all sorts of problems.
        // chunkFilename: '[name].[hash].js',  // contenthash
        // filename: "[name].[hash].js"  // contenthash
        chunkFilename: "[name].[hash].js", // contenthash
        filename: "[name].[hash].js" // contenthash
    },
    optimization: {
        // Below breaks webworker, because calls window from within it.
        // Really, we need separrate compiles for webworker and main.

        moduleIds: "hashed",
        splitChunks: {
            chunks: "all",
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: "vendors",
                    chunks: "all"
                }
            }
        },
        runtimeChunk: "single"
    }
});
