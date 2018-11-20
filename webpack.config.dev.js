/**
 * @Author: Detcx 
 * @Date: 2018-11-20 15:17:32
 * @Last Modified by: Detcx
 * @Last Modified time: 2018-11-20 17:38:59
 * @description development
 */

const os = require('os');
const path = require('path');
const webpack = require('webpack');
const HappyPack = require('happypack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HappyThreadPool = HappyPack.ThreadPool({size: os.cpus().length - 1});
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin; // 可视化分析


module.exports = {
  mode: 'development',
  devtool: false,
  entry: './src/index.jsx',
  output: {
    filename: 'bundle/[name].bundle[hash:6].js',
    chunkFilename: 'bundle/[name].bundle[chunkhash:6].js', // 'bundle/[id].bundle[chunkhash:6].js'
    path: path.resolve(__dirname, 'dist'), // 打包后的目录，必须是绝对路径
    publicPath: '/' // 静态资源路径
  },

  optimization: {
    splitChunks: {
      name: true,
      chunks: "all",
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
          }
        ]
      }
    ]
  },

  devServer: {
    hot: true,
    open: true, // Boolean String
    https: false,
    port: '8062',
    publicPath: '/',
    host: 'localhost',
    historyApiFallback: true,
    contentBase: path.resolve(__dirname, 'dist')
  },

  resolve: {
    modules: [path.resolve(__dirname, 'node_modules')],
    extensions: ['.js', '.jsx', '.es6'],
    mainFields: ['jsnext:main', 'browser', 'main'] // 配合 scope hoisting
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin(), // 热模块替换
    new webpack.optimize.ModuleConcatenationPlugin(), // scope hoisting
    new CleanWebpackPlugin(['dist'], {exclude: ['dll', 'cache']}), // 清理时排除 
    // dll
    new webpack.DllReferencePlugin({
      manifest: require('./dist/dll/react.manifest.json')
    }),
    new webpack.DllReferencePlugin({
      manifest: require('./dist/dll/polyfill.manifest.json')
    }),
    // 分离 css
    new MiniCssExtractPlugin({
      filename: 'static/css/[name][contenthash:6].css',
      chunkFilename: 'static/css/[name][contenthash:6].css' // 供应商(vendor)样式文件
    }),
    // 模板
    new HtmlWebpackPlugin({
      filename: 'index.html',
      title: 'webpack-suggestion-dev',
      favicon: __dirname + '/favicon.ico',
      template: __dirname + '/index.html'
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

    ]),
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
    /* 
    // 可视化分析
    new BundleAnalyzerPlugin({
      analyzerPort: 2018,
      generateStatsFile: true
    })
    */
  ]
}
