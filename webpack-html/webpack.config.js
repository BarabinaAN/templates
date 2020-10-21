var path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');


module.exports = (env = {}) => {

  const { mode = 'dev' } = env
  const isProd = mode === 'prod'
  const isDev = mode === 'dev'

  const getStyleLoaders = () => {
    return [
      isProd ? MiniCssExtractPlugin.loader : 'style-loader', 'css-loader', 'postcss-loader'
    ]
  }

  const getPlugins = () => {
    let plugins = [
      new HtmlWebpackPlugin({
        template: 'public/index.html'
      }),
      new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
        'window.jQuery': 'jquery'
      }),
    ]
    if (isProd) {
      plugins.push(
        new MiniCssExtractPlugin({
          filename: '[name]-[hash:7].css'
        }),
        new CleanWebpackPlugin(),
      )
    }
    return plugins
  }

  const getOptimisations = () => {
    return {
      minimizer: [
        new UglifyJsPlugin(),
        new OptimizeCssAssetsPlugin()
      ],
    }
  }

  return {
    output: {
      publicPath: isProd ? './' : isDev && "/",
      path: path.resolve(__dirname, 'build'),
      filename: '[name].[hash:7].js',
    },
    mode: isProd ? 'production' : isDev && "development",
    module: {
      rules: [
        {
          test: /\.js/,
          exclude: /node_modules/,
          loader: 'babel-loader'
        },
        {
          test: /\.(jpg|svg|png|jpeg)$/,
          use: [{
            loader: 'file-loader',
            options: {
              outpath: 'images',
              name: 'images/[name].[ext]'
            }
          }]
        },
        {
          test: /\.(eot|ttf|woff|woff2|ico)$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[name].[ext]',
                outputPath: 'fonts'
              }
            }
          ]
        },
        {
          test: /\.css/,
          use: getStyleLoaders()
        },
        {
          test: /\.s[ca]ss/,
          use: [...getStyleLoaders(), 'postcss-loader', 'sass-loader']
        }
      ]
    },
    plugins: getPlugins(),
    optimization: isProd && getOptimisations(),
    devServer: {
      contentBase: path.join(__dirname, 'dist'),
      historyApiFallback: true,
      open: true
    }
  }
}