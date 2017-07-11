const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const WebpackManifestPlugin = require('webpack-manifest-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const pkg = require('./package.json');
const env = process.env.NODE_ENV;
const src = {
    js: './src/js',
    filename: 'main.js'
};
const dist = {
    public: './public',
    js: '/js',
    css: '/css',
    filename: 'bundle'
};
let plugins = [
    new CleanWebpackPlugin([
        `${dist.public}${dist.js}`,
        `${dist.public}${dist.css}`,
    ]),
    new WebpackManifestPlugin(),
    new webpack.EnvironmentPlugin({
        NODE_ENV: env
    }),
    new webpack.DefinePlugin({
        __VERSION__: JSON.stringify(pkg.version)
    })
];
const config = {
    entry: `${src.js}/${src.filename}`,
    output: {
        path: path.join(__dirname, dist.public)
    },
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

if (env === 'production') {
    // Configure Prod
    config.output.filename = `${dist.js}/${dist.filename}.[chunkhash].js`;
    plugins.push(
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        }),
        new OptimizeCssAssetsPlugin({
            cssProcessorOptions: { discardComments: { removeAll: true } }
        }),
        new ExtractTextPlugin({
            filename: `${dist.css}/${dist.filename}.[chunkhash].css`
        })
    );
} else {
    // Configure Dev
    config.output.filename = `${dist.js}/${dist.filename}.js`;
    plugins.push(
        new ExtractTextPlugin({
            filename: `${dist.css}/${dist.filename}.css`
        })
    );
}

config.plugins = plugins;

module.exports = config;
