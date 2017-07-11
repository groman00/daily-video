const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const WebpackManifestPlugin = require('webpack-manifest-plugin');
const pkg = require('./package.json');
const src = {
    js: './src/js'
};
const dist = {
    public: './public',
    js: '/js',
    css: '/css'
};

module.exports = {
    entry: `${src.js}/main.js`,
    output: {
        path: path.join(__dirname, dist.public),
        filename: `${dist.js}/[name].[chunkhash].js`,
    },
    plugins: [
        new WebpackManifestPlugin(),
        new webpack.EnvironmentPlugin({
            NODE_ENV: 'production'
            // NODE_ENV: 'development'
        }),
        new ExtractTextPlugin({
            filename: `${dist.css}/[name].[chunkhash].css`,
            disable: false,
            allChunks: true
        }),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        }),
        new OptimizeCssAssetsPlugin({
            cssProcessorOptions: { discardComments: { removeAll: true } }
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
                use: ExtractTextPlugin.extract({
                    use: 'css-loader!sass-loader',
                    publicPath: dist.css
                })
            }
        ]
    }
};