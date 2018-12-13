const path = require('path');
const nodeExternals = require('webpack-node-externals');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        'component/index': './dist/schematics/component/index.js',
        'ng-add/index': './dist/schematics/ng-add/index.js',
    },
    output: {
        path: path.resolve(__dirname, 'dist/schematics'),
        filename: '[name].js',
        libraryTarget: 'commonjs2'
    },
    mode: 'production',
    target: 'node',
    externals: [
        nodeExternals({
            whitelist: [
                '@angular-devkit/schematics', 
                '@schematics/angular', 
                '@angular-devkit/core'
            ]
        })
    ],
    plugins: [
        new CopyWebpackPlugin([
            {
                from: './schematics/**/*.json',
                to: '../'
            },
            {
                from: './schematics/**/files/**/*',
                to: '../'
            }
        ],
        {})
    ]
};