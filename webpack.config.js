module.exports = {
  entry: './src/js/master.js',
  output: {
    path: __dirname,
    filename: 'master.bundle.js'
  },
  devtool: 'source-map',
  module: {
    loaders: [
      { test: /\.css$/, loader: 'style-loader!css-loader' }
    ]
  }
};
