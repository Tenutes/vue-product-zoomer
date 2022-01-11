const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');
const isProduction = process.env.NODE_ENV !== 'production';
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: isProduction ? 'production' : 'development',
  devServer: {
    contentBase: './dist',
  },
  devtool: isProduction ? 'source-map' : false,
  entry: {
    app: './src/publish.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'assets/js/app.bundle.js',
    library: 'ProductZoomer',
    libraryTarget: 'umd'
  },
  resolve: {
    modules: ['node_modules'],
    extensions: ['.js', '.json', '.jsx', '.vue'],
    plugins: [],
    symlinks: false,
    alias: {
      vue: path.resolve(`./node_modules/vue`)
    }
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
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: file => /node_modules/.test(file) && !/\.vue\.js/.test(file),
        options: {
          presets: ['@babel/preset-env'],
          plugins: [
            [
              '@babel/plugin-proposal-class-properties',
              {
                loose: true
              }
            ]
          ]
        }
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
      chunks: 'async',
      minSize: 0,
      maxSize: 30000,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      automaticNameDelimiter: '~',
      cacheGroups: {
        vendorsDefault: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    }
  }
}
