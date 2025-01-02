// you 32067 
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const glob = require('glob');

module.exports = {
    mode: 'production', // Set mode to production to enable minification
    entry: {
        main: glob.sync('./client/src/scripts/*.ts').map(file => path.resolve(__dirname, file)), // Main entry point
        cavesiter: './cavesiter/cavesiter', // Another entry point
        // Add more entry points as needed
    },
    output: {
        filename: '[name].bundle.js', // Output bundle files with entry point names
        path: path.resolve(__dirname, 'dist'),
    },
    devtool: 'source-map', // Enable source maps
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
        minimize: false, // Disable minimization
        usedExports: false, // Disable tree shaking
        minimizer: [new TerserPlugin({
            terserOptions: {
                sourceMap: true, // Enable source maps in Terser
            },
         })], // Use TerserPlugin for minification
    },
};