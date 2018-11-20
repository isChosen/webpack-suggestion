/**
 * @Author: Detcx 
 * @Date: 2018-11-20 15:15:56 
 * @Last Modified by: Detcx
 * @Last Modified time: 2018-11-20 15:16:02
 * @description configuration
 */

const os = require('os');
const path = require('path');
const webpack = require('webpack');
const HappyPack = require('happypack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HappyThreadPool = HappyPack.ThreadPool({size: os.cpus().length - 1});
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');


module.exports = {
  mode: 'production',
  devtool: false,
  entry: './src/index.jsx',
  output: {
    filename: 'bundle/[name].bundle[hash:6].js',
    chunkFilename: 'bundle/[id].bundle[chunkhash:6].js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/'
  },

  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        cache: path.resolve(__dirname, 'dist/cache'),
        parallel: os.cpus().length - 1
      })
    ],
    splitChunks: {
      name: true,
      chunks: 'all',
      maxAsyncRequests: 15,
      maxInitialRequests: 10,
      automaticNameDelimiter: "-",
      cacheGroups: {
        libs: {
          name: 'chunk-libs',
          test: /[\\/]node_modules[\\/]/,
          priority: 10,
          chunks: 'initial'
        },
        antd: {
          name: 'chunk-antd',
          test: /[\\/]node_modules[\\/]antd[\\/]/,
          priority: 20,
          chunks: 'async'
        }
      }
    }
  },

  module: {
    rules: [
      {
        test: /\.(jsx?|es6)$/,
        exclude: path.resolve(__dirname, 'node_modules'),
        use: 'happypack/loader?id=jsx'
      },
      /* node_modules 引入的样式不需要模块化 */
      {
        test: /\.css$/,
        include: [path.resolve(__dirname, 'node_modules')],
        use: [
          MiniCssExtractPlugin.loader,
          'happypack/loader?id=cssNodeModules'
        ]
      },
      {
        test: /\.less$/,
        include: [path.resolve(__dirname, 'node_modules')],
        use: [
          MiniCssExtractPlugin.loader,
          'happypack/loader?id=lessNodeModules'
        ]
      },
      /* 非 node_modules 样式模块化 */
      {
        test: /\.css$/,
        exclude: [path.resolve(__dirname, 'node_modules')],
        use: [
          MiniCssExtractPlugin.loader,
          'happypack/loader?id=cssExcNodeModules'
        ]
      },
      {
        test: /\.less$/,
        exclude: [path.resolve(__dirname, 'node_modules')],
        use: [
          MiniCssExtractPlugin.loader,
          'happypack/loader?id=lessExcNodeModules'
        ]
      },
      {
        test: /\.(gif|png|jpe?g|svg)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              fallback: 'file-loader',
              limit: 8192,
              name: '[name][hash:4].[ext]',
              outputPath: 'static/images/'
            }
          },
          { // 压缩图片
            loader: 'image-webpack-loader',
            options: {
              mozjpeg: {
                progressive: true,
                quality: 65
              },
              optipng: {
                enabled: false
              },
              pngquant: {
                quality: '65-90',
                speed: 4
              },
              gifsicle: {
                interlaced: false
              },
              webp: {quality: 75}
            }
          }
        ]
      }
    ]
  },

  resolve: {
    modules: [path.resolve(__dirname, 'node_modules')],
    extensions: ['.js', '.jsx', '.es6'],
    mainFields: ['jsnext:main', 'browser', 'main'] // 配合 scope hoisting
  },

  plugins: [
    new webpack.optimize.ModuleConcatenationPlugin(), // scope hoisting
    new CleanWebpackPlugin(['dist'], {exclude: ['dll']}), // 清理时排除 dist/dll
    // 动态链接库
    new webpack.DllReferencePlugin({
      manifest: require("./dist/dll/react.manifest.json")
    }),
    new webpack.DllReferencePlugin({
      manifest: require("./dist/dll/polyfill.manifest.json")
    }),
    // 分离 css
    new MiniCssExtractPlugin({
      filename: 'static/css/[name][contenthash:6].css',
      chunkFilename: 'static/css/[id][contenthash:6].css' // 供应商(vendor)样式文件
    }),
    // 压缩分离的 css
    new OptimizeCssAssetsPlugin({
      cssProcessor: require('cssnano'),
      cssProcessorOptions: {
        discardComments: {removeAll: true}
      },
      canPrint: true // 是否将插件信息打印到控制台
    }),
    // 模板
    new HtmlWebpackPlugin({
      filename: "index.html",
      title: "webpack-suggestion-pro",
      favicon: __dirname + "/favicon.ico",
      template: __dirname + "/index.html"
    }),
    // 多进程
    new HappyPack({
      id: 'jsx',
      loaders: ['babel-loader?cacheDirectory'],
      threadPool: HappyThreadPool
    }),
    new HappyPack({
      id: 'cssNodeModules',
      loaders: [
        'css-loader',
        'postcss-loader'
      ],
      threadPool: HappyThreadPool
    }),
    new HappyPack({
      id: 'lessNodeModules',
      loaders: [
        'css-loader',
        'postcss-loader',
        'less-loader'
      ],
      threadPool: HappyThreadPool
    }),
    new HappyPack({
      id: 'cssExcNodeModules',
      loaders: [
        {
          loader: 'css-loader',
          options: {
            modules: true,
            importLoaders: 1,
            localIdentName: '[local]-[hash:base64:4]'
          }
        },
        'postcss-loader',
      ],
      threadPool: HappyThreadPool
    }),
    new HappyPack({
      id: 'lessExcNodeModules',
      loaders: [
        {
          loader: 'css-loader',
          options: {
            modules: true,
            importLoaders: 2,
            localIdentName: '[local]-[hash:base64:4]'
          }
        },
        'postcss-loader',
        'less-loader'
      ],
      threadPool: HappyThreadPool
    }),
    // 复制静态资源
    new CopyWebpackPlugin([
      {
        from: 'static/css/',
        to: 'static/css/[name].[ext]',
        toType: 'template'
      },
      {
        from: 'static/fonts/',
        to: 'static/fonts/',
        toType: 'dir'
      },
      {
        from: 'static/images/global/',
        to: 'static/images/global/',
        toType: 'dir'
      },
      {
        from: 'static/libs',
        to: 'static/libs',
        toType: 'dir'
      }
    ])
  ]
}
