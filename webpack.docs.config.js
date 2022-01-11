const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');
const isProduction = process.env.NODE_ENV !== 'production';
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: isProduction ? 'production' : 'development',
  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'docs'),
    },
  },
  entry: {
    app: './src/docs.js'
  },
  output: {
    path: path.resolve(__dirname, 'docs'),
    filename: 'assets/js/[name].bundle.js',
    chunkFilename: 'assets/js/[name].bundle.js'
  },
  resolve: {
    modules: ['node_modules'],
    extensions: ['.js', '.json', '.jsx', '.vue'],
    plugins: []
  },
  module: {
    rules: [
      {
        test: /\.(png|jpg|gif|svg)$/,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
      {
        test: /\.vue$/,
        use: 'vue-loader',
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          'css-loader',
        ],
      },
    ],
  },
  plugins: [
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({
      template: './src/assets/index.html',
      title: 'Vue Product Zoomer',
      appMountId: 'app',
      filename: 'demo.html'
    }),
    new TerserPlugin({
      parallel: true,
      terserOptions: {
        ecma: 6,
      },
    }),
    new MiniCssExtractPlugin({
      filename: "[name].css"
    })
  ],
  optimization: {
    splitChunks: {
      chunks: 'all',
      minSize: 0,
      maxSize: 30000,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      automaticNameDelimiter: '~',
      cacheGroups: {
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    },
    runtimeChunk: {
      // manage common package relationship
      name: 'manifest'
    }
  }
}
