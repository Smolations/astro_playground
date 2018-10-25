const path = require('path')
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

// Since Webpack will be run directly within Phoenix, we'll use the `MIX_ENV`
// variable instead of `NODE_ENV`.
const env = process.env.MIX_ENV === 'prod' ? 'production' : 'development'

const plugins = {
  production: [
    // Only run in production. Produce minified JS.
    new webpack.optimize.UglifyJsPlugin({
      compress: { warnings: false }
    })
  ],
  development: []
}

module.exports = {
  devtool: 'source-map',
  entry: [
    path.join(__dirname, 'assets/js/app.jsx'),
    path.join(__dirname, 'assets/scss/app.scss')
  ],
  output: {
    path: path.join(__dirname, '/priv/static'),
    filename: 'js/app.js'
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        include: path.join(__dirname, 'assets/js'),
        exclude: /node_modules/
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            { loader: 'css-loader', options: { importLoaders: 1 } },
            'postcss-loader', // for minifying CSS/adding vendor prefixes
            'sass-loader'
          ]
        })
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10000
            }
          }
        ]
      }
    ]
  },
  plugins: [
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
    new ExtractTextPlugin({
      filename: 'css/app.css',
      allChunks: true
    }),
    new CopyWebpackPlugin([
      { from: path.join(__dirname, 'assets', 'static') }
    ])
  ].concat(plugins[env]),
  resolve: {
    modules: [
      'node_modules',
      'assets/js'
    ],
    // Add '.ts' and '.jsx' as resolvable extensions.
    extensions: ['.jsx', '.js', '.json'],
    alias: {
      phoenix: path.join(__dirname, '/deps/phoenix/priv/static/phoenix.js'),
      phoenix_html: path.join(__dirname, '/deps/phoenix_html/priv/static/phoenix_html.js')
    }
  }
}
