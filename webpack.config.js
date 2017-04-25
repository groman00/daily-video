const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
// var OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const src = {
    js: './src/js'
};

const dist = {
    js: './public/js'
};

module.exports = {
    entry: src.js + '/main.js',
    output: {
        filename: 'bundle.js',
        path: path.join(__dirname, dist.js)
    },
    plugins: [
        new webpack.EnvironmentPlugin({
            NODE_ENV: 'production'
            // NODE_ENV: 'development'
        }),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        }),
        new ExtractTextPlugin({
            filename: '../css/style.css',
            disable: false,
            allChunks: true
        })
    ],
    resolve: {
        alias: {
            'vue$': 'vue/dist/vue.esm'
        }
    },
    module: {
        loaders: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                include: [path.join(__dirname, src.js)]
            },
            {
                test: /\.scss$/,
                loader: ExtractTextPlugin.extract('css-loader!sass-loader')
            }
        ]
    }
};