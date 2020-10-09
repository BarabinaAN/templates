var path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (env = {}) => {

  const { mode = 'dev' } = env
  const isProd = mode === 'prod'
  const isDev = mode === 'dev'

  const getStyleLoaders = () => {
    return [
      isProd ? MiniCssExtractPlugin.loader : 'style-loader', 'css-loader'
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
        })
      )
    }
    return plugins
  }

  return {
    output: {
      publicPath: isProd ? './' : isDev && "/",
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
          use: [...getStyleLoaders(), 'sass-loader']
        }
      ]
    },
    plugins: getPlugins(),
    devServer: {
      contentBase: path.join(__dirname, 'dist'),
      historyApiFallback: true,
      open: true
    }
  }
}