// webpack.config.js

const path = require('path');
const { VueLoaderPlugin } = require('vue-loader');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
// const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const env = process.env.NODE_ENV;

module.exports = {
    entry: {
        app: './src/index.ts'
    },
    mode: env,
    devtool: "source-map",
    output: {
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/',
        filename: '[name].bundle.js',
        chunkFilename: "[name].bundle.js",
        libraryTarget: "umd", // universal module definition
    },
    resolve: {
        extensions: ['.ts', '.js', '.tsx', '.jsx', '.vue', '.json'], //TK can't tell if this is actually necessary but is in all the sample code I found
        alias: {
            'vue$': 'vue/dist/vue.esm.js'
        }
    },
    optimization: {
        occurrenceOrder: false,
        minimize: true,
        splitChunks: {
            chunks: 'all',
            cacheGroups: {
                default: false
            }
        }
    },
    module: {
        rules: [
            {
                // SCSS Compilation : sass / scss loader for webpack
                test: /\.(sass|scss)$/i,
                use: ExtractTextPlugin.extract({
                    // fallback: 'style-loader',
                    use: [
                        {
                            loader: 'css-loader',
                            options: {
                                minimize: true
                            }
                        },
                        {
                            loader: 'sass-loader',
                            options: {
                                minimize: true
                            }
                        }
                    ]
                })
            },
            {
                test: /\.(woff(2)?|ttf|eot|svg|png|jpg|gif|svg)(\?v=\d+\.\d+\.\d+)?$/,
                use: [{
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]',
                        outputPath: 'assets/'
                    }
                }]
            },
            // TK THE LOADER: needed to process typescript files. Note the option used. We'll also need sfc.d.ts so that typescript can find the necessary .vue files
            // TK make sure to npm install ts-loader and npm link typscript if its installed globally
            {
                test: /\.ts$/,
                exclude: /(node_modules|bower_components|vue\/src)/,
                loader: 'ts-loader',
                options: {
                    appendTsSuffixTo: [/\.vue$/]
                }
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                exclude: /(node_modules|bower_components)/,
                options: { // 2.5 UPDATE: vue-cli handles all this stuff for you now, it bundles an external config called vue-loader.conf.js and imports it as vueLoderConfig
                    // no need to worry about any of it
                    esModule: true, // TK Make sure this is added and true
                }
            }
        ]
    },
    plugins: [
        // make sure to include the plugin for the magic
        new VueLoaderPlugin(),

        // Extract CSS from javascript file and put it into another CSS file in dist folder
        new ExtractTextPlugin({
            // define where to save the file
            filename: 'assets/css/[name].bundle.css',
            allChunks: true
        }),

        new HtmlWebpackPlugin({
            inject: true,
            title: 'Vue.js Examples',
            template: `${__dirname}/src/index.html`,
            filename: `${__dirname}/dist/index.html`, //relative to root of the application
        }),
    ],
    /* devServer: {
        historyApiFallback: true,
        noInfo: false
    },
    performance: {
        hints: false
    }, */

}

/*
if (process.env.NODE_ENV === 'production') {
    module.exports.devtool = '#source-map'
    // http://vue-loader.vuejs.org/en/workflow/production.html
    module.exports.plugins = (module.exports.plugins || []).concat([
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"production"'
            }
        }),
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: true,
            compress: {
                warnings: false
            }
        }),
        new webpack.LoaderOptionsPlugin({
            minimize: true
        })
    ])
}
 */
