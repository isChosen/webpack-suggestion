const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: {
    // 将 React 相关的模块放到一个单独的动态链表库中
    react: ['react', 'react-dom'],
    // 将项目需要所有的 polyfill 放到一个单独的动态链接库中
    polyfill: ['core-js/fn/object/assign', 'core-js/fn/promise', 'whatwg-fetch']
  },
  output: {
    // 输出动态链接库的文件名称, [name] 代表当前动态链接库的名称
    // 也就是 entry 中配置的 react 和 polyfill, etc
    filename: '[name].dll.js',
    path: path.resolve(__dirname, 'dist/dll'),
    // 存放动态链接库的全局变量名称, 例如对于 react 来时就是 _dll_react,  加上 _dll_ 防止全局变量冲突
    library: '_dll_[name]'
  },
  plugins: [
    new CleanWebpackPlugin(['dist/dll/']),
    // 接入 DllPlugin
    new webpack.DllPlugin({
      // 动态链表库的全局变量名称, 和 output.library 一致
      // 该字段的值也就是输出的 manifest.json 文件中 name 字段的值,
      // 例如在 react.manifest.json 中就有 "name": "_dll_react"
      context: __dirname,
      name: '_dll_[name]',
      // 描述动态链接库的 manifest.json 文件输出时的文件名称
      path: path.join(__dirname, 'dist/dll', '[name].manifest.json')
    })
  ]
}

