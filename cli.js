#!/usr/bin/env node

const version = require('./package.json').version;
const program = require('commander');
const Koa = require('koa');
const koaWebpack = require('koa-webpack');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

program
  .version(version)
  .usage('[options]')
  .parse(process.argv);

const app = new Koa();

const config = {
  entry: [
    './index.js',
    'webpack-hot-middleware/client',
  ],
  output: {
    filename: '[hash]-index.js',
    publicPath: '/',
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './index.html',
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
  ],
  module: {
    rules: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      use: [{
        loader: 'babel-loader',
        options: {
          presets: [
            ['env', { modules: false }],
            'react',
          ],
          plugins: [
            'transform-object-rest-spread',
          ],
        },
      }],
    }, {
      test: /\.(png|gif|jpg|svg)$/,
      use: [{
        loader: 'file-loader',
        options: { name: '[hash]-[name].[ext]' },
      }],
    }],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
};
app.use(koaWebpack({ config }));

const port = process.env.PORT || 8080;
app.listen(port);
console.log('Listening on', port);
