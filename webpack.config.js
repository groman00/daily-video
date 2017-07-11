require('dotenv').config();

const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const WebpackManifestPlugin = require('webpack-manifest-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const S3Plugin = require('webpack-s3-plugin');
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
    new WebpackManifestPlugin({
        publicPath: env === 'production' ? 'https://s3.amazonaws.com/alpha-global-origin/daily-video/assets' : ''
    }),
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
        filename: `${dist.js}/${dist.filename}${(env === 'production' ? '.[chunkhash]' : '')}.js`,
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
        }),
        new S3Plugin({
            include: /.*\.(css|js$)/,
            basePath: 'daily-video/assets/',
            directory: path.join(__dirname, dist.public),
            s3Options: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
            },
            s3UploadOptions: {
                Bucket: 'alpha-global-origin'
            }
        })
    );
} else {
    // Configure Dev
    plugins.push(
        new ExtractTextPlugin({
            filename: `${dist.css}/${dist.filename}.css`
        })
    );
}

config.plugins = plugins;

module.exports = config;
