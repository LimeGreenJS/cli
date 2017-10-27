#!/usr/bin/env node

const version = require('./package.json').version;
const fs = require('fs');
const path = require('path');
const program = require('commander');
const Koa = require('koa');
const koaWebpack = require('koa-webpack');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

let nodeModulesDir = path.resolve(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesDir)) {
  nodeModulesDir = './node_modules'; // fallback to default
}

const runDev = ({ port = 8080 }) => {
  const app = new Koa();
  const config = {
    entry: [
      './index.js',
      `${nodeModulesDir}/webpack-hot-middleware/client`,
    ],
    output: {
      filename: '[hash]-index.js',
      publicPath: '/',
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: `${nodeModulesDir}/raw-loader!./index.html`,
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
          loader: `${nodeModulesDir}/babel-loader`,
          options: {
            presets: [
              [`${nodeModulesDir}/babel-preset-env`, {
                modules: false,
                exclude: ['transform-regenerator'],
              }],
              `${nodeModulesDir}/babel-preset-react`,
            ],
            plugins: [
              `${nodeModulesDir}/babel-plugin-transform-object-rest-spread`,
              `${nodeModulesDir}/babel-plugin-syntax-dynamic-import`,
            ],
          },
        }],
      }, {
        test: /\.(png|gif|jpg|svg)$/,
        use: [{
          loader: `${nodeModulesDir}/file-loader`,
          options: { name: '[hash]-[name].[ext]' },
        }],
      }],
    },
    resolve: {
      modules: [nodeModulesDir],
      extensions: ['.js', '.jsx'],
    },
  };
  app.use(koaWebpack({ config }));
  app.listen(port);
  console.log('Listening on', port);
};

program
  .version(version);

program
  .command('dev')
  .description('run dev server')
  .option('-p, --port [port]', 'Port number, defaults to 8080')
  .action((options) => {
    program.commandFound = true;
    runDev(options);
  });

program.parse(process.argv);

if (!program.commandFound) {
  program.help();
}
