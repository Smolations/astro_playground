const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

// Since Webpack will be run directly within Phoenix, we'll use the `MIX_ENV`
// variable instead of `NODE_ENV`.
const env = process.env.MIX_ENV === 'prod' ? 'production' : 'development'
const devMode = env !== 'production';

const plugins = {
  production: [
    // Only run in production. Produce minified JS.
    // new webpack.optimize.UglifyJsPlugin({
    //   compress: { warnings: false }
    // })
  ],
  development: []
}

module.exports = {
  devtool: 'source-map',
  mode: env,
  // optimization: {
  //   minimizer: ,
  // },
  entry: [
    path.join(__dirname, 'assets/js/app.jsx'),
    path.join(__dirname, 'assets/scss/app.scss')
  ],
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        include: path.join(__dirname, 'assets/js'),
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: [
            '@babel/env',
          ],
        }
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
            },
          },
          // 'css-loader',
          'postcss-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
        },
      },
    ],
  },
  output: {
    path: path.join(__dirname, '/priv/static'),
    filename: 'js/app.js',
  },
  plugins: [
    // new webpack.HotModuleReplacementPlugin(),
    new CleanWebpackPlugin([
      path.join(__dirname, 'priv/static')
    ]),
    // Important to keep React file size down
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(env)
      }
    }),
    // Add this plugin so Webpack won't output the files when anything errors
    // during the build process
    new webpack.NoEmitOnErrorsPlugin(),
    // new ExtractTextPlugin({
    //   filename: 'css/app.css',
    //   allChunks: true
    // }),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: "css/app.css",
      chunkFilename: "css/[id].css"
    }),
    new CopyWebpackPlugin([
      { from: path.join(__dirname, 'assets', 'static') }
    ]),
  ].concat(plugins[env]),
  resolve: {
    modules: [
      'node_modules',
      'assets/js'
    ],
    extensions: ['.js', '.jsx', '.json'],
    alias: {
      phoenix: path.join(__dirname, '/deps/phoenix/priv/static/phoenix.js'),
      phoenix_html: path.join(__dirname, '/deps/phoenix_html/priv/static/phoenix_html.js')
    }
  },
  // devServer: {
  //   contentBase: path.join(__dirname, "public/"),
  //   port: 3000,
  //   publicPath: "http://localhost:3000/dist/",
  //   hotOnly: true
  // },
}
