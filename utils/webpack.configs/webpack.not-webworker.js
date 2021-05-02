const webpack = require("webpack");
const merge = require("webpack-merge");
const common = require("./webpack.common.js");
const HtmlWebpackPlugin = require("html-webpack-plugin");
// const HtmlWebpackIncludeAssetsPlugin = require("html-webpack-include-assets-plugin");
var HtmlWebpackExcludeAssetsPlugin = require("html-webpack-exclude-assets-plugin");
var CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");
const WorkboxPlugin = require("workbox-webpack-plugin"); // for PWA
// const {CleanWebpackPlugin} = require('clean-webpack-plugin');
// const VueLoaderPlugin = require('vue-loader/lib/plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = merge(common, {
    entry: {
        app: path.join(__dirname, "../../src/index.ts")
    },
    plugins: [
        // new CleanWebpackPlugin(),
        // new HtmlWebpackPlugin({}),
        // new HtmlWebpackIncludeAssetsPlugin({
        // new BundleAnalyzerPlugin({
        //     // analyzerPort: 8889
        //     analyzerMode: "static"
        // }),
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
            // QRCode: "qrcode",
            // "window.QRCode": "qrcode",
            $3Dmol: "3dmol",
            "window.$3Dmol": "3dmol",
            bootstrap: "bootstrap",
            "window.bootstrap": "bootstrap"
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: "src/babylon_scenes", to: "environs" },
                { from: "src/js", to: "js" },
                // { from: "node_modules/babylonjs-serializers/babylonjs.serializers.min.js", to: "js/babylonjs.serializers.min.js"},
                { from: "node_modules/file-saver/dist/FileSaver.min.js", to: "js/FileSaver.min.js"},
                { from: "src/components/UI/Vue/Components/OpenPopup/pages", to: "pages" },
                {
                    from: "src/components/Mols/3DMol/nanokid.sdf",
                    to: "nanokid.sdf"
                },
                {
                    from: "src/components/Mols/3DMol/1xdn.pvr",
                    to: "1xdn.pvr"
                },
                { from: "src/pwa/icon-192.png", to: "icon-192.png" },
                { from: "src/pwa/icon-256.png", to: "icon-256.png" },
                { from: "src/pwa/icon-512.png", to: "icon-512.png" },
                { from: "src/pwa/icon-1024.png", to: "icon-1024.png" },
                { from: "src/pwa/icon-256-maskable.png", to: "icon-256-maskable.png" },
                {
                    from: "src/pwa/manifest.webmanifest",
                    to: "manifest.webmanifest"
                },
                { from: "src/styles/style.css", to: "style.css" },
                { from: "src/styles/favicon.ico", to: "favicon.ico" },
                { from: "node_modules/qrcode/build/qrcode.min.js", to: "js/qrcode.min.js"},
                { from: "src/components/Plugins/LoadSave/SaveModel/blender_mat_example.png", to: "blender_mat_example.png"}
            ]
        }),
        new WorkboxPlugin.GenerateSW({
            // This should be the last plugin. See
            // https://developers.google.com/web/tools/workbox/guides/codelabs/webpack.

            // These options encourage the ServiceWorkers to get in there fast
            // and not allow any straggling "old" SWs to hang around. See
            // https://webpack.js.org/guides/progressive-web-application/
            clientsClaim: true,
            skipWaiting: true,
            // swDest: 'sw.js'
            runtimeCaching: [
                {
                    // urlPattern: /\./,
                    urlPattern: './',
                    handler: "NetworkFirst", // First check the network. If that fails, use cache...
                    options: {
                        cacheableResponse: {statuses: [200]}
                    }
                },
                {
                    urlPattern: './vrmlWebWorker.js',
                    handler: "NetworkFirst", // First check the network. If that fails, use cache...
                    options: {
                        cacheableResponse: {statuses: [200]}
                    }
                },
                // {
                //     urlPattern: './js/profiles/profilesList.json',
                //     handler: "NetworkFirst", // First check the network. If that fails, use cache...
                //     options: {
                //         cacheableResponse: {statuses: [200]}
                //     }
                // },
            ],
            ignoreURLParametersMatching: [/./],
            // include: [/index.html/],
            exclude: [
                /js\/profiles\//,  // So controller models will always be loaded remotely.
                /\.md$/,
                /environs\/(?!day|arrow|.+?\.json)/,  // leave only one scene (day) and json files.
                /favicon\.ico/,
                /icon-[^5].*?\.png/,  // only keep one icon
                /peer\.min\.js/,  // No need to cache this. Because if you don't have an internet connection, it won't work anyway.
                /leader\.html/,
                /\.map$/,
                /\.manifest$/,
                /\.mp3$/,
                /\.pvr$/,
                /\.old$/,
                /pages\/imgs\//,  // non essential (help images)
                /glyphicons-halflings-regular.(?!woff)$/,
            ],
        }),
        // new VueLoaderPlugin()
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
            { test: /\.htm$/i, loader: 'html-loader' },
            // {
            //     test: /\.vue$/,
            //     loader: 'vue-loader'
            // }
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
            minSize: 100000,
            maxSize: 500000,
            maxAsyncRequests: 30,
            maxInitialRequests: 30,
            minChunks: 1,
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: "vendors",
                    chunks: "all",
                    reuseExistingChunk: true,
                }
            }
        },
        runtimeChunk: "single"
    }
});
