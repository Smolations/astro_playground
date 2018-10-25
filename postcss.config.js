// The Webpack config also includes `postcss-loader` to minify CSS and add
// vendor prefixing. It loads the configurations set on this file.

// The list of browsers that we support
const supportedBrowsers = ['last 2 versions']

module.exports = {
  plugins: [
    require('autoprefixer')({ browsers: supportedBrowsers }), // add vendor prefixes
    require('cssnano')() // advanced CSS minificaion
  ]
}
