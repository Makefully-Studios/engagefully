/* global __dirname, module, require */
const
    path = require('path'),
    deploy = path.join(__dirname, 'lib');

module.exports = (env) => ({
    stats: 'errors-only',

    mode: env.dev ? 'development' : 'production',

    devServer: {
        static: path.join(__dirname, '/static')
    },

    entry: {
        "engagefully": ['@babel/polyfill', path.join(__dirname, '/src/index.js')]
    },

    output: {
        path: deploy
    },

    plugins: [],
    
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules\/(?!canvas-drawing-tool)|bower_components)/,
                use: {
                    loader: 'babel-loader'
                }
            },
            {
                test: /\.(otf|woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            useRelativePath: true
                        }
                    }
                ]
            },
            {
                test: /\.(png|jpg|gif)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            outputPath: './assets/image/'
                        }
                    }
                ]
            },
            {
                test: /\.(mp3|ogg)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            outputPath: './assets/audio/'
                        }
                    }
                ]
            },
            {
                test: /\.(mp4)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            outputPath: './assets/video/'
                        }
                    }
                ]
            }
        ]
    }
});
