const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');

module.exports = (env = {}) => {
   const { mode = 'dev' } = env;
   const isProd = mode === 'prod';
   const isDev = mode === 'dev';

   const getStyleLoaders = () => [
      isProd ? MiniCssExtractPlugin.loader : 'style-loader', 'css-loader', 'postcss-loader',
   ];

   const getFavicons = () => {
      const favicons = {
         appleStartup: false,
         coast: false,
      };

      if (!isProd) {
         return {
            ...favicons,
            android: false,
            appleIcon: false,
            windows: false,
            yandex: false,
            firefox: false,
         };
      }

      return favicons;
   };

   const getPlugins = () => {
      const plugins = [
         new HtmlWebpackPlugin({
            template: 'public/index.html',
         }),
         new FaviconsWebpackPlugin({
            logo: './src/images/icon/favicon.svg',
            prefix: 'favicons/',
            favicons: {
               background: '#ddd',
               theme_color: '#333',
               icons: getFavicons(),
            },
         }),
         new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery',
         }),
      ];
      if (isProd) {
         plugins.push(
            new MiniCssExtractPlugin({
               filename: '[name]-[hash:7].css',
            }),
            new CleanWebpackPlugin(),
         );
      }
      return plugins;
   };

   const getOptimisations = () => ({
      minimizer: [
         new UglifyJsPlugin(),
         new OptimizeCssAssetsPlugin(),
      ],
   });

   return {
      output: {
         publicPath: isProd ? './' : isDev && '/',
         path: path.resolve(__dirname, 'build'),
         filename: '[name].[hash:7].js',
      },
      mode: isProd ? 'production' : isDev && 'development',
      module: {
         rules: [
            {
               test: /\.js/,
               exclude: /node_modules/,
               loader: 'babel-loader',
            },
            {
               test: /\.(jpg|svg|png|jpeg)$/,
               use: [
                  {
                     loader: 'file-loader',
                     options: {
                        outpath: 'images',
                        name: '[path]/[name].[ext]',
                        context: 'src',
                     },
                  },
                  {
                     loader: 'image-webpack-loader',
                     options: {
                        mozjpeg: {
                           progressive: true,
                        },
                        optipng: {
                           enabled: false,
                        },
                        pngquant: {
                           quality: [0.65, 0.90],
                           speed: 4,
                        },
                        gifsicle: {
                           interlaced: false,
                        },
                        webp: {
                           quality: 75,
                        },
                     },
                  },
               ],
            },
            {
               test: /\.(eot|ttf|woff|woff2|ico)$/,
               use: [
                  {
                     loader: 'file-loader',
                     options: {
                        name: '[name].[ext]',
                        outputPath: 'fonts',
                     },
                  },
               ],
            },
            {
               test: /\.css/,
               use: getStyleLoaders(),
            },
            {
               test: /\.s[ca]ss/,
               use: [...getStyleLoaders(), 'postcss-loader', 'sass-loader'],
            },
         ],
      },
      plugins: getPlugins(),
      optimization: isProd ? getOptimisations() : {},
      devServer: {
         contentBase: path.join(__dirname, 'build'),
         historyApiFallback: true,
         open: true,
      },
   };
};