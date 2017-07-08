const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
// var OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const pkg = require('./package.json');
let WebpackChunkHashPlugin = require('webpack-chunk-hash');
let WebpackManifestPlugin = require('webpack-manifest-plugin');

// Webpack Caching
// https://webpack.js.org/guides/caching/

const src = {
    js: './src/js'
};

const dist = {
    js: './public/js/'

};

module.exports = {
    entry: src.js + '/main.js',
    output: {
        // filename: 'bundle.js',
        path: path.join(__dirname, dist.js),
        filename: '[name].[chunkhash].js',
        // publicPath: path.join(__dirname, dist.js),
    },
    plugins: [
        // new WebpackChunkHashPlugin(),
        // new webpack.optimize.CommonsChunkPlugin({
        //   names: ['vendor', 'manifest'],
        // }),
        new WebpackManifestPlugin({
            //fileName: 'my-manifest.json',
            publicPath: '/js/'
        }),
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
            //filename: '../css/[name].css',
            filename: '../css/[name].css',
            // filename:  (getPath) => {
            //     return getPath('css/[name].css').replace('css/js', 'css');
            // },
            disable: false,
            allChunks: true
        }),
        new webpack.DefinePlugin({
            __VERSION__: JSON.stringify(pkg.version)
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