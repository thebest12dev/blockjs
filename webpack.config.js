// you 32067 
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const glob = require('glob');

module.exports = {
    mode: 'production', // Set mode to production to enable minification
    entry: glob.sync('./client/src/scripts/*.ts').map(file => path.resolve(__dirname, file)), // Resolve paths correctly
    output: {
        filename: 'bundle.js', // Output bundle file
        path: path.resolve(__dirname, 'dist'),
    },
    resolve: {
        extensions: ['.ts', '.js'], // Resolve TypeScript and JavaScript files
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.(png|jpg|gif|svg)$/,
                use: {
                    loader: 'url-loader',
                    options: {
                        limit: 8192,
                    },
                },
            },
        ],
    },
    optimization: {
        minimize: true, // Enable minimization
        minimizer: [new TerserPlugin()], // Use TerserPlugin for minification
    },
};
