const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const webpackDashboard = require('webpack-dashboard/plugin');

module.exports = merge(common, {
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
        contentBase: './dist',
        hot: false,  // This breaks webworkers if true.
        liveReload: true
    },
    plugins: [
        new webpackDashboard(),
    ]
});
