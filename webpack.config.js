const path = require("path");
const webpack = require("webpack");

module.exports = {
  //Entry point to start bundling...
  entry: './src/index.js',
  //Change this to 'production' for optimizations
  mode: "development",
  module: {
    rules: [
      {
        //Load js and jsx
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: { presets: ['env'] }
      },
      {
        //Load css
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader' ]
      },
        {
            test: /\.(gif|jpe?g|png|ico)$/,
            loader: 'url-loader?limit=10000'
        },
        {
            test: /\.(otf|eot|svg|ttf|woff|woff2).*$/,
            loader: 'url-loader?limit=10000'
        },
    ]
  },
  resolve: {
    //Resolve by filename without extensions
    extensions: ['*', '.js', '.jsx', '.mjs'],
    //Resolve by absolute path
    modules: [
      path.resolve('./src'),
      'node_modules'
    ]
  },
  output: {
    //Output to ./dist/bundle.js
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    //For devServer to find directory from project root
    publicPath: '/dist/'
  },
  devServer: {
    contentBase: path.join(__dirname, '/'),//public/
    port: 3000,
    //For devServer to find directory from web user
    publicPath: 'http://localhost:3000/dist/',
    hotOnly: true,
    open: true
  },
  plugins: [ new webpack.HotModuleReplacementPlugin() ]
};
