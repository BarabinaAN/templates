const path = require('path');

const fs = require('fs');

const PATHS = {
   src: path.join(__dirname, 'src'),
   build: path.join(__dirname, 'build'),
   assets: 'assets/',
};
const PAGES_DIR = `${PATHS.src}/pug/pages/`;
const PAGES = fs.readdirSync(PAGES_DIR).filter((fileName) => fileName.endsWith('.pug'));

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
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
         ...PAGES.map((page) => new HtmlWebpackPlugin({
            template: `${PAGES_DIR}/${page}`,
            filename: `./${page.replace(/\.pug/, '.html')}`,
         })),
         new FaviconsWebpackPlugin({
            logo: `${PATHS.src}/${PATHS.assets}images/icon/favicon.svg`,
            prefix: `${PATHS.assets}favicons/`,
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
               filename: `${PATHS.assets}[name]-[hash:7].css`,
            }),
            new CopyWebpackPlugin({
               patterns: [
                  { from: `${PATHS.src}/${PATHS.assets}images`, to: `${PATHS.assets}images` },
               ],
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
      entry: {
         app: PATHS.src,
      },
      output: {
         publicPath: isProd ? './' : isDev && '/',
         path: PATHS.build,
         filename: `${PATHS.assets}[name].[hash:7].js`,
      },
      mode: isProd ? 'production' : isDev && 'development',
      module: {
         rules: [
            {
               test: /\.pug$/,
               loader: 'pug-loader',
            },
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
                        name: '[path]/[name].[ext]',
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
                        outputPath: `${PATHS.assets}fonts`,
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
         contentBase: PATHS.build,
         historyApiFallback: true,
         open: true,
      },
   };
};