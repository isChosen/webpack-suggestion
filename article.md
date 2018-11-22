1. **前言**
    * 本篇文章介绍时下前端最火热的模块化打包工具 webpack，配合 react 演示搭建前端单页面应用项目的基本配置和讲解各项配置的具体作用。进一步介绍如何优化 webpack 配置，提升项目的打包速度、网页的加载速度、可视化分析项目所依赖的模块，实现所谓的性能优化。如果理解了本文介绍的全部内容，相信也能顺利扩展到 angular 或 vue 等其他框架。而且还不会 react 的朋友，看完本文后应该对 react 也会有一个基本的认识！
    * 本文讲解步骤如下(最好对应版本号，避免莫名 BUG)：
        * **<span  style="color: #3300FF; ">基本配置</span>**
            - 版本:
                * node 10.13.0
                * npm 6.4.1
                * yarn 1.12.3
                * webpack 4.25.1
                * webpack-cli 3.1.2
                * react 16.5.2
                * react-dom 16.5.2
                * react-router 3.2.1
                * react-router 4(扩展)
            - [**<span  style="color: #AE87FA; ">webpack-primary</span>**](#webpack_primary) 最基本的配置：最基本最简单的配置；
            - [**<span  style="color: #AE87FA; ">webpack-integrate</span>**](#webpack_integrate) 整合相关配置：
                * 相关加载器 loader
                * 相关插件 plugin
                * 样式模块化 CSS-Modules
                * 本地服务和代理方式：
                    * webpack-dev-server
                    * webpack-dev-middleware
        * **<span  style="color: #3300FF; ">优化配置</span>** (换成H5页面-满脑子都是骚操作)
            - **<span  style="color: #AE87FA; ">webpack-split</span>** 提取公共代码：
                * 优化层面: Development Production
                * 原理: 抽离代码块 chunk, 利用浏览器缓存
                * 演示: optimization.splitChunks
                * 优点: 减少请求次数和流量, 降低服务器成本
                * 缺点: 首次打开网站时, 得不到优化
            - **<span  style="color: #AE87FA; ">webpack-dll</span>** 动态链接库：
                * 优化层面: Development
                * 原理: 将第三方模块整合进动态链接库, 只要不升级模块, 就不需要重新编译这些模块
                * 演示: webpack.config.dll.js, script 标签引入到 html 模板中
                * 优点: 大幅提升构建速度
                * 缺点: 独立打包，两次构建
            - **<span  style="color: #AE87FA; ">webpack-happy</span>** 多进程：
                * 优化层面: Development
                * 原理: 多进程处理任务
                * 演示: js, es, css 均可使用此法编译
                * 优点: 大幅提升构建速度
                * 缺点: 配置稍微复杂
            - **<span  style="color: #AE87FA; ">webpack-onDemand</span>** 按需加载：
                * 优化层面: Development Production
                * 原理: require.ensure
                * 演示: webpack4+ + react-router3
                * 优点: 在路由点做代码分割, 切换路由时才加载脚本, 提升网站性能
                * 缺点: 暂未发现
            - **<span  style="color: #AE87FA; ">webpack-onDemand-v4</span>** 按需加载：
                * 优化层面: Development Production
                * 原理: import(/* webpackChunkName chunk-home */ './Home')
                * 演示： webpack4+ + react-router4
                * 优点: 在路由点做代码分割, 切换路由时才加载脚本, 提升网站性能
                * 缺点: 暂未发现
            - **<span  style="color: #CC6666; ">输出分析</span>**：
                * 原理： webpack-bundle-analyzer 插件实现；
                * 演示： 插件可视化 -> 静态页面/本地服务页面。
            - **<span  style="color: #CC6666; ">配置建议</span>**：
                * Dev： webpack.config.dev.whole.js
                * Pro： webpack.config.pro.whole.js
***
2. <a id="webpack_primary">**webpack-primary**</a>
    * package.json 依赖包如下：
```json
	{
      "name": "webpack-primary",
      "version": "1.0.0",
      "description": "",
      "main": "index.js",
      "keywords": [],
      "author": "Detcx",
      "license": "ISC",
      "devDependencies": {
        "@babel/core": "^7.1.5",
        "@babel/preset-env": "^7.1.5",
        "@babel/preset-react": "^7.0.0",
        "babel-loader": "^8.0.4",
        "html-webpack-plugin": "^3.2.0",
        "webpack": "^4.25.1",
        "webpack-cli": "^3.1.2",
        "webpack-dev-server": "^3.1.10"
      },
      "dependencies": {
        "react": "^16.5.2",
        "react-dom": "^16.5.2"
      },
      "scripts": {
        "build": "rimraf dist && webpack --config webpack.config.js",
        "server": "webpack-dev-server"
      }
	}
``` 
  * 注意: rimraf 是我全局安装的一个清理文件的 npm 包，跟 linux 中 rm -rf 命令差不多。
  * webpack4+ 配置项
    * mode: 环境设置，开发环境用 development，生产环境用 production，环境的不同构建出来的文件名也会有所差别，比如，以 chunkFilename 构建出来的块文件名；
    * entry: 入口，即 webpack 从此文件开始寻找各种依赖的模块；
    * output: 出口，配置输出文件名(filename)，文件块名(chunkFilename)，输出路径(path)，静态资源路径(publicPath-一般是域名目录)；
    * module: 加载器，一系列规则都是用来编译模块的，比如 jsx 语法就用 babel-loader，模块中有外部样式文件就用 css-loader 和其他像 style-loader 等一起完成编译模块任务，etc；
    * devServer: 本地服务器，用作平时本地开发调试使用；
    * resolve: 配置模块的解析方式，比如 extensions 表示扩展名，如果引入的模块扩展名在 extensions 中，可以省略其后缀；
    * plugins: 功能强大的插件配置。

```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	mode: 'development', // development production
	entry: './src/index.jsx', // 入口， 可以有多个
	output: {
		filename: '[name].bundle.js',
		chunkFilename: '[name].[chunkhash:6].js',
		path: path.resolve(__dirname, 'dist'),
		publicPath: '/'
	},

	module: {
		rules: [
			{
				test: /\.(jsx?|es6)$/,
				exclude: /node_modules/,
				use: 'babel-loader'
			}
		]
	},

	devServer: {
		open: true, // 启动后打开浏览器
		port: '8034',
		https: false, // 用 http
		publicPath: '/',
		contentBase: path.resolve(__dirname, 'dist'), // 本地服务器的根目录
		host: 'localhost'
	},

	resolve: {
		modules: [path.resolve(__dirname, 'node_modules')], // 第三方模块路径
		extensions: ['.js', '.jsx', '.es6'] // 扩展名，尽量少写，且越靠前越优先匹配
	},

	plugins: [
		new HtmlWebpackPlugin({ // 模板插件
			filename: 'index.html', // 输出的文件名
			title: 'webpack-基本配置',
			favicon: __dirname + '/favicon.ico',
			template: __dirname + '/index.html'
		})
	]
}
```
  * 注意: 我用的是 **yarn**(下载 yarn-[version].msi 管理员模式的命令行安装 yarn). 执行命令 **yarn build** 或者 **yarn server**。
		* webpack-primary 详细代码地址：[点击查看](https://github.com/isChosen/webpack-primary)，欢迎下载查看，**star** 一下，感激不尽！

	3. <a id="webpack_integrate">**webpack-integrate**</a>



		* 项目依赖包 package.json 就不贴图了，所有依赖和对应版本号可从仓库下载查看，仓库地址下文给出，项目结构见下图：
		* 
		* React 是一个非常灵活的框架，既可以负责整个页面的 UI，也可以只负责某个DOM节点。webpack-integrate 展示了 React 只负责 id="root" 的 DOM 节点。这么设计是为了更好地说明 webpack 是如何处理 css 样式文件的，同时下文也即将要着重介绍 样式模块化（CSS Module）。
		* 先分析下目录结构。一般组件都放在 src 文件目录中，通常还有一个 static（存放图片和字体文件）和 src 同级，那样也可以，不过我这里简便点，都放在 src 中，方便组件中引用，即使有 static 我也是将其放在 src 中。css 目录中，我一般用来放全局样式，比如 reset.css、outer.css（React管理不到的范围的样式），React 组件用的到样式放在 less 中然后引入到各自的组件中，此时需要配置less-loader（sass类似），当然，很多朋友不用 less 或 sass，把 React 组件用到的样式直接用 css 文件书写也可以放在 css 目录下，为了区分全局样式，可以在 css 目录下再建一个名为 global 的文件存放外部（React管理不到的范围）样式，就像上图中 image/outer 目录存放外部图片一样。这样做是因为，有些情况像下图中类名为 "outer-txt" 的样式，这些外部样式文件没被 React 组件引用，所以不会被 webpack 编译构建输出。但是在输出目录（dist）中必须存在，所以需要用到插件 copy-webpack-plugin 将全局或外部（React管理不到的范围）的静态资源（css，fonts，image）拷贝到 dist 中，这种情况下的外部静态资源文件需要手动添加到模板（index.html）中（见下面的模板截图）。而经过 webpack 编译构建的静态资源会由 webpack 自动添加到模板中并输出一份新的 index.html。另外，静态资源只有被引入到组件中使用，才会被配置的相关加载器编译构建，例如：上图中 src/images 有4张图片（outer目录除外），构建后在 dist/images 中就只出现了2张，那是因为dragonCat-2.png 我没用着，而 avatar.jpg 因小于 8k 被转成了 base64，所以构建后 dist/images 中就只剩2张了。相关配置见下文或者从我仓库里拷贝项目到本地查看。模板（index.html）截图如下：
		* 
		* .babelrc 配置文件，转换 JSX，ES6，ES7 语法的代码成浏览器能识别的传统 JavaScript 代码：

			* "@babel/core": "^7.1.5", // bable-loader 核心依赖
			* "@babel/preset-env": "^7.1.5", // bable-loader 核心依赖
			* "@babel/preset-react": "^7.0.0", // bable-loader 解析 React 的依赖

{    "presets": [        "@babel/preset-env",        "@babel/preset-react"    ]}

		* 样式前缀配置文件 postcss.config.js ，可以设置最近的几个版本，设置越多就兼容越好，但有可能影响整个项目构建速度。此处设置了50个版本！会出现前缀 -moz- 和 -o-：

module.exports = {    map: false,    plugins: [        require('autoprefixer')({browsers: ['last 50 versions']})    ]}

		* 样式模块化(CSS Modules)：项目开发中不同开发者或者不同的组件中定义的样式名有可能相同而导致冲突，通常为了避免这种冲突，一般我们会和同事沟通后手动添加自己的前缀或者全写在一个全局样式文件中。最终导致，增加了沟通的成本或者修改同一个全局样式文件经常报 conflict。CSS Modules 能够很方便地解决这种问题，实现每个组件定义自己的样式，webpack 再通过其他 loader 和 plugin，将引入到组件内的自定义样式文件（exclude node_modules）提取到一个外部主样式文件（比如 main.cb9922.css），其中的样式名都带有各自组件的 hash（分配的hash不一样），即使与其他组件的类名相同，因每个类名都带有 hash 值，样式也不会冲突覆盖。而引入到组件内的第三方样式，即供应商(vendor)的样式文件（include node_modules）就不需要模块化，原样输出为一个单独的样式文件，但是此处需要添加 optimization.splitChunks 配置才不会将 vendor 的样式混在主样式（main.cb9922.css）中，如下图：
		* 
		* optimization 是一个非常有用的优化配置项，除了刚提到的配合分离自定义样式和第三方样式的功能外，还有其他很强大的功能，下文会继续介绍。原文解释如下：

By default webpack v4+ provides new common chunks strategies out of the box for dynamically imported modules. See available options for configuring this behavior in the SplitChunksPlugin page.// 默认情况下，webpack v4+ 为动态导入的模块提供了开箱即用的新常见块策略。请参阅SplitChunksPlugin页面中的可用选项以配置此行为

		* 继续 CSS Modules，处理样式模块当然要用到样式加载器：css-loader、设置前缀：postcss-loader、提取分离：MiniCssExtractPlugin 插件（需要安装依赖 mini-css-extract-plugin），我这里不用style-loader 而是使用 MiniCssExtractPlugin。注意，开箱即用理念下 postcss-loader 不能使用 CSS Modules，要使他们在一起能正常地工作，需要在 css-loader 配置中设置属性importLoaders(Number of loaders applied before CSS loader)。原文解释如下：

This loader [cannot be used] with [CSS Modules] out of the box due to the way css-loader processes file imports. To make them work properly, either add the css-loader’s [importLoaders] option.

		* 关于设置样式名 localIdentName，个人感觉官网介绍得有点复杂了，简单设置应该就够了吧！配置如下：

// modulemodule: {    rules: [        /* node_modules 引入的样式不需要模块化 */        {            test: /\.css$/,            include: [path.resolve(__dirname, 'node_modules')],            use: [                MiniCssExtractPlugin.loader,                'css-loader',                'postcss-loader'            ]        },        /* 非 node_modules 样式模块化 */        {            test: /\.css$/,            exclude: [path.resolve(__dirname, 'node_modules')],            use: [                MiniCssExtractPlugin.loader,                {                    loader: 'css-loader',                    options: {                        modules: true,                        importLoaders: 1,                        localIdentName: '[local]-[hash:base64:4]'                    }                },                'postcss-loader'            ]        },        {            test: /\.less$/,            exclude: [path.resolve(__dirname, 'node_modules')],            use: [                MiniCssExtractPlugin.loader,                {                    loader: 'css-loader',                    options: {                        modules: true,                        importLoaders: 2,                        localIdentName: '[local]-[hash:base64:4]'                    }                },                'postcss-loader',                'less-loader'            ]        }    ]}// pluginsplugins: [    new MiniCssExtractPlugin({ // 分离 css        filename: 'css/[name][contenthash:6].css',        chunkFilename: 'css/[id][contenthash:6].css' // 供应商(vendor)样式文件    }),    new CopyWebpackPlugin([ // 拷贝: 原样输出        {            from: 'src/fonts/',            to: 'fonts/[name].[ext]',            type: 'template'        },        {            from: 'src/css/',            to: 'css/[name].[ext]',            type: 'template'        }    ])]

		* 关于 CSS Modules 的一般配置就上面那些，另外，在组件中它分配给同一个类名只有一个 hash，正常来说我们也不会重复定义某个类名去写不同的 DOM 样式，极端情况，整个组件就一个类名，这肯定不合理。通常某个类名会多次嵌套在其他类名中的，应该是激活样式，如 active、current 或 on 等其他自定义类名。它们可能出现在很多地方，但不需要担心，注意下书写格式，其他语法跟正常写样式一样。Greeting.jsx 组件写了添加和移除激活样式类名的示例，建议结合代码阅读本文比较易于理解，见下图：
		* 
		* 本地服务

			* webpack-dev-server

				* hot： 启用热模块替换，需在 plugins 中实例化一个 webpack 的内部插件 HotModuleReplacementPlugin；
				* historyApiFallback： 支持使用 H5 History API 历史前进后退功能，这个很有必要设置；
				* proxy： 配置如下，项目中以 '/api' 开头的请求将会发送到 'http://10.10.10.1:8090' 下的 '/api'。注意区别 Nginx 代理设置

// Nginxserver {    listen                8018;    server_name        localhost;            location / { #请求的 url 过滤，正则匹配        #root   html;        root D:/works/detcx;        index    index.html    index.htm;    }    location /v1/holy {        proxy_pass https://200.200.200.1/v1/holy;    }}


			* devServer 配置如下：

devServer: {    hot: true,    https: false,    progress: true,    port: '8022',    open: 'Chrome', // Boolean, String    publicPath: '/',    host: 'localhost',    clientLogLevel: 'error',    historyApiFallback: true,    contentBase: path.resolve(__dirname, 'dist'),    proxy: {        '/api': 'http://10.10.10.1:8090',        '/v1/holy': {              target: 'https://200.200.200.1',              secure: false // http -> https         }    }},// ------------ plugins -------------------------new webpack.HotModuleReplacementPlugin()

		* webpack-dev-middleware 中间件

			* 安装依赖 webpack-dev-middleware；
			* 项目目录下添加文件 webpack.middle.server.js 和目录 mock，mock 用于存放自定义的接口文件 api.js；
			* webpack.middle.server.js 和平常搭建本地 node 服务差不多，只是增加了一些 webpack 的配置，具体配置见代码。下图示例：
			* 
			* 启动：在项目 webpack-integrate 目录下用命令行启动服务>node webpack.middle.server.js 或者 执行yarn server-middle，在浏览器中手动输入自身命令行提示的路径即可看到页面，代码有改动保存后命令行会重新编译，但不会自动刷新浏览器页面。验证，在 Hello.jsx 组件中发送请求验证，查看控制台，结果正确打印说明中间件启动的服务器没问题，下图示例：
			* 
		* MiddleServer，DevServer 对比：

			* 两种方式都能启动本地服务以调试代码，如果要模拟接口请求发送的过程，MiddleServer 只要启动一个本地服务(node-server)，DevServer 启动两个(webpack-server和node-server)；
			* MiddleServer 需要手动打开浏览器输入地址，没有热更新；
			* DevServer 刚好相反，启动后自动打开页面，有热更新；
			* DevServer 在 webpack.config.dev.js 中配置，配置集中化，proxy 还可以代理到更多远程服务。
		* webpack-integrate 详细代码地址：https://github.com/isChosen/webpack-integrate，欢迎下载查看，star 一下，感激不尽！


	* webpack-split

		* 提取公共代码，现在的前端应用一般都是用框架构建，通常每个页面都是采用同样的技术栈及同一套样式代码，这就导致这些页面之间有很多相同的代码。如果每个页面的代码都将这些公共部分包含进去，则会造成相同资源被重复加载，打包后的资源文件过大而浪费用户流量和增加服务器成本，同时网页首屏加载缓慢，用户体验极差。所以这就需要将公共代码抽离成单独的文件。本节讲解如何运用optimization.splitChunks 配置实现抽离公共代码。官网原话：

SplitChunksPluginOriginally, chunks (and modules imported inside them) were connected by a parent-child relationship in the internal webpack graph. The CommonsChunkPlugin was used to avoid duplicated dependencies across them, but further optimizations were not possibleSince webpack v4, the CommonsChunkPlugin was removed in favor of optimization.splitChunks.// 意思是，SplitChunksPlugin插件用来实现分离公共代码，但webpack4+之后就不用这个插件了，换成使用配置：optimization.splitChunks.

		* 示例配置：

optimization: {    splitChunks: {        chunks: 'all',        minSize: 30000,        maxSize: 0,        minChunks: 1,        maxAsyncRequests: 5,        maxInitialRequests: 3,        automaticNameDelimiter: '~',        name: true,        cacheGroups: {            vendors: {                test: /[\\/]node_modules[\\/]/,                priority: -10            },            default: {                minChunks: 2,                priority: -20,                reuseExistingChunk: true            }        }    }}

		* 本节换用 H5 页面，相关布局设计请下载代码查看，只是作为 demo 演示，感兴趣的话自行研究；
		* chunks： 这表示将选择哪些块进行优化；
		* minSize： 块体积最小 30kb；
		* maxSize： 块最大体积，推荐是 244k。不过最大最小体积设置有时候只是作为一个 hint 并不是很严格，如图：
		* 
		* minChunks： 设置至少被其它模块共享的次数，只有满足这个次数的共享模块才会被提取；
		* maxInitialRequests： 初始化时分割块的最大数目。项目中页面初始化用到的依赖(如React, Axios, etc)应该设置其 chunks: 'initial'。chuanks 为 initial 的依赖若超过 maxInitialRequests 值，priority 值较低的都被打包成一个块；
		* maxAsyncRequests： 异步分割块的最大数目，项目中由事件触发的业务的依赖(如Echarts)应该设置其 chunks: 'async'。chuanks 为 async 的依赖若超过 maxAsyncRequests 值，priority 值较低的都被打包成一个块；
		* cacheGroups： 缓存组，提取公共代码配置。在 output 中设置的 chunkFilename: 'js/[name][chunkhash:6].js' 到这里就派上用场了，只要公共文件代码没改变，chunkhash 就不会变，所以能达到长期缓存的作用，如下图，修改 Home.jsx 后执行构建，发现主文件 main 的 hash 值变了，但以 chunkhash 打出来的块，如 antd 的 hash 值没变。
		* 
		* 
		* 为了说明问题，本节中引入了常用的几个大框架、库文件作为示例，splitChunks 配置如下：

optimization: {    splitChunks: {        chunks: 'all',        maxAsyncRequests: 15,        maxInitialRequests: 10,        automaticNameDelimiter: '-',        cacheGroups: {            libs: {                name: 'chunk-libs',                test: /[\\/]node_modules[\\/]/i,                priority: 10,                chunks: 'initial' // 只打包初始时依赖的第三方            },            echarts: {                name: 'chunk-echarts',                test: /[\\/]node_modules[\\/]echarts[\\/]/i,                priority: 15, // 权重要大于 libs 和 main, 不然会被打包进 libs 或 main                chunks: 'async'            },            antDesign: {                name: 'chunk-antd',                test: /[\\/]node_modules[\\/]antd[\\/]/i,                priority: 20,                chunks: 'initial'            },            lodash: {                name: 'chunk-lodash',                test: /[\\/]node_modules[\\/]lodash[\\/]/i,                priority: 25,                chunks: 'initial'            },            react: {                name: 'chunk-react',                test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/i,                priority: 30, // 权重要大于 libs 和 main, 不然会被打包进 libs 或 main                chunks: 'initial'            }        }    }},

		* webpack-split 详细代码地址：https://github.com/isChosen/webpack-split，欢迎下载查看，star 一下，感激不尽！


	* webpack-dll

		* 一个动态链接库可以包含为其他模块调用的函数和数据。web 项目构建接入动态链接库的思想，需要完成以下事情：

			* 将网页依赖的基础模块抽离出来，打包到一个个单独的动态链接库中。在一个动态链接库中可以包含多个模块；
			* 当需要导入的模块在于某个动态链接库中时，这个模块不能被再次打包，而是去动态链接库中获取；
			* 页面依赖的所有动态链接库都需要被加载。
		* web 项目构建接入动态链接库的思想后，会大大提高构建速度，原因在于，包含大量复用模块的动态链接库只需被编译一次，在之后的构建过程中被动态链接库包含的模块将不会重新编译，而是直接使用动态链接库中的代码。由于动态链接库中的大多数包含的是常用的第三方模块，例如 react、react-dom，所以只要不升级这些模块的版本，动态链接库就不用重新编译。
		* webpack 已经内置了对动态链接库的支持，需要通过以下两个内置的插件接入：

			* DllPlugin： 用于打包出一个个单独的动态链接库文件，生成 [name].dll.js 和 [name].manifest.json 文件；
			* DllReferencePlugin： 用于在主要的配置文件(如 webpack.config.dev.js)中引入 DllPlugin 插件打包好的动态链接库文件。
		* 用于生成动态库文件的配置：webpack.config.dll.js，如下：

const path = require('path');const webpack = require('webpack');const CleanWebpackPlugin = require('clean-webpack-plugin');module.exports = {    mode: 'development',    entry: {        // 将 React 相关的模块放到一个单独的动态链表库中        react: ['react', 'react-dom'],        // 将项目需要所有的 polyfill 放到一个单独的动态链接库中        polyfill: ['core-js/fn/object/assign', 'core-js/fn/promise', 'whatwg-fetch'],        echarts: ['echarts']    },    output: {        // 输出动态链接库的文件名称, [name] 代表当前动态链接库的名称        // 也就是 entry 中配置的 react 和 polyfill, etc        filename: '[name].dll.js',        path: path.resolve(__dirname, 'dist/dll'),        // 存放动态链接库的全局变量名称, 例如对于 react 来时就是 _dll_react, 加上 _dll_ 防止全局变量冲突        library: '_dll_[name]'    },    plugins: [        new CleanWebpackPlugin(['dist/dll/']),        // 接入 DllPlugin        new webpack.DllPlugin({            // 动态链表库的全局变量名称, 和 output.library 一致            // 该字段的值也就是输出的 manifest.json 文件中 name 字段的值,            // 例如在 react.manifest.json 中就有 "name": "_dll_react"            context: __dirname,            name: '_dll_[name]',            // 描述动态链接库的 manifest.json 文件输出时的文件名称            path: path.join(__dirname, 'dist/dll', '[name].manifest.json')        })    ]}

		* 执行脚本命令 yarn build-dll 看到在 dist/dll 中生成了 [name].dll.js 和 [name].manifest.json 文件；
		* [name].dll.js： 即动态链接库，包含了大量模块代码，这些模块被存放在一个数组里，用数组的索引号作为 ID。并且通过 _dll_[name] 变量将自己暴露在全局中，即可以通过 window._dll_[name] 访问到其中包含的模块；
		* [name].manifest.json： 用于描述动态链接库文件中包含哪些模块，以及每个模块的路径和 ID；
		* [name].bundle.js 是被编译出来的执行入口文件，在遇到其依赖的模块在 dll.js 文件中时，会直接通过 dll.js 文件暴露的全局变量获取打包在 dll.js 文件中的模块，所以在模板 index.html 中需要将依赖的动态链接库 dll.js 文件手动添加进去，如下图：
		* 
		* 动态链接库文件需要独立打包构建：

			* dll 配置文件：webpack.config.dll.js，构建命令：build-dll；
			* 主构建配置文件：webpack.config.dev.js，构建命令：build-dev；
			* 见 package.json 文件，所以说使用动态链接库需要构建两次，不过可以合并成一次构建，比如服务命令 server-dev：

				* 如果 dist/dll 下动态链接库文件存在，则，"server-dev": "webpack-dev-server --config webpack.config.dev.js"；
				* 如果 dist/dll 下动态链接库文件不存在，则，"server-dev": "npm run build-dll && webpack-dev-server --config webpack.config.dev.js"；
			* package.json 设置命令：

"scripts": {    "build-dll": "webpack --progress --config webpack.config.dll.js",    "build-dev": "webpack --progress --config webpack.config.dev.js",    "server-dev": "npm run build-dll && webpack-dev-server --config webpack.config.dev.js"}

		* 动态链接库文件需要接入主构建配置中才能实现其作用，webpack.config.dev.js 的 plugins 选项中做如下设置：

plugins: [    new webpack.DllReferencePlugin({        manifest: require('./dist/dll/react.manifest.json')    }),    new webpack.DllReferencePlugin({        manifest: require('./dist/dll/polyfill.manifest.json')    }),    new webpack.DllReferencePlugin({        manifest: require('./dist/dll/echarts.manifest.json')    })]

		* 作为优化配置的第一节 webpack-split(提取公共代码)，和本节 webpack-dll(动态链接库)相比，他们的组件代码一样，经配置 dll 之后的编译构建速度在 split 之上(随机对比)，如下图。而相对于没做优化处理的 webpack 配置的构建速度会更快，而且项目越大，对比越明显。配合下文即将讲解的 webpack-happy(多进程)，三者结合的配置使得 webpack 在编译模块和构建项目的打包过程中，速度将更快！
		* 
		* webpack-dll 详细代码地址：https://github.com/isChosen/webpack-dll，欢迎下载查看，star 一下，感激不尽！


	* webpack-happy

		* 原文一句话介绍：

HappyPack makes initial webpack builds faster by transforming files in parallel.

		* JavaScript 是单线程语言，但可以开启多进程处理事务。通常地，在构建生产环境代码时会卡在一个时间点(一般是92%那里！)，卡在那个时间点其实就是在压缩代码，由于 JavaScript 压缩代码时，需要先将代码解析成用 Object 抽象表示的 AST 语法树，再应用各种规则分析和处理 AST，所以导致这个过程计算量巨大，耗时非常多；
		* webpack 通过 happypack 依赖来开启多进程来编译和压缩文件，将多个文件的编译压缩工作分配给多个子进程去完成，子进程还是通过相同的插件（比如压缩用的是UglifyJS）去处理工作，但这整个过程变成了并行执行。处理完成后将结果返回主进程，所以使用多进程能更快速地完成对多个文件的编译构建和压缩打包处理任务；
		* 首先安装依赖 happypack 和 os(用来计算计算机核数，确定开启共享进程池的数量)，HappyPack 的配置是使用插件和加载器结合一起完成工作的，所以需要配置两处地方，原文如下：

HappyPack provides both a plugin and a loader in order to do its job so you must use both to enable it.Normally, you define loader rules to tell webpack how to process certain files. With HappyPack, you switch things around so that you pass the loaders to HappyPack's plugin and instead tell webpack to use happypack/loader.

		* 替换 loader 和配置插件 plugins：

const os = require('os');const HappyPack = require('happypack');const UglifyJsPlugin = require('uglifyjs-webpack-plugin'); // js 压缩插件const HappyThreadPool = HappyPack.ThreadPool({size: os.cpus().length - 1}); // 共享进程池optimization: {    /*    minimizer: [ // production 启用多进程压缩js        new UglifyJsPlugin({            cache: path.resolve(__dirname, 'dist/cache'),            parallel: os.cpus().length - 1        })    ]    */}// rulesrules: [    {        test: /\.jsx?$/,        exclude: path.resolve(__dirname, 'node_modules'),        use: 'happypack/loader?id=jsx'    },    /* node_modules 引入的样式不需要模块化 */    {        test: /\.css$/,        include: [path.resolve(__dirname, 'node_modules')],        use: [            MiniCssExtractPlugin.loader,            'happypack/loader?id=cssNodeModules'        ]    },    {        test: /\.less$/,        include: [path.resolve(__dirname, 'node_modules')],        use: [            MiniCssExtractPlugin.loader,            'happypack/loader?id=lessNodeModules'        ]    },    /* 非 node_modules 样式模块化 */    {        test: /\.css$/,        exclude: [path.resolve(__dirname, 'node_modules')],        use: [            MiniCssExtractPlugin.loader,            'happypack/loader?id=cssExcNodeModules'        ]    }]// pluginsplugins: [    // 多进程    new HappyPack({        id: 'jsx',        loaders: ['babel-loader?cacheDirectory'],        threadPool: HappyThreadPool    }),    new HappyPack({        id: 'cssNodeModules',        loaders: [            'css-loader',            'postcss-loader'        ],        threadPool: HappyThreadPool    }),    new HappyPack({        id: 'lessNodeModules',        loaders: [            'css-loader',            'postcss-loader',            'less-loader'        ],        threadPool: HappyThreadPool    }),    new HappyPack({        id: 'cssExcNodeModules',        loaders: [            {                loader: 'css-loader',                options: {                    modules: true,                    importLoaders: 1,                    localIdentName: '[local]-[hash:base64:4]'                }            },            'postcss-loader',        ],        threadPool: HappyThreadPool    })]

		* 说明

			* 将 rules 中的 loader 替换成 happypack/loader，在 plugins 中配置 happypack，这两处的配置须设置相同的 id 才能对应得上。本文编译处理样式模块使用了模块化(CSS Modules)和提取分离样式(MiniCssExtractPlugin)，在配置样式的 loader 时，若将 MiniCssExtractPlugin 提供的 loader 整合在 happypack 插件中会出现问题，不能正常使用，样式模块只有在经过 happypack/loader 处理之后再使用 MiniCSSExtractPlugin.loader 提取分离，才能正常工作，所以在 loader 中他俩是并级的；
			* 处理 js 模块时设置缓存 cacheDirectory，能提升下一次的编译构建速度；
			* 一般配置多进程的是编译处理 js 和 css，图片字体文件等就不用配置了；
			* 构建生产环境的代码：

				* 压缩 js，启用多进程：

optimization: {    minimizer: [        new UglifyJsPlugin({            cache: path.resolve(__dirname, 'dist/cache'),            parallel: os.cpus().length - 1        })    ]}



				* 压缩 css，此处没启用多进程，读者可自行探索：

plugins: [    new webpack.BannerPlugin('@CopyRight-Detcx'),    // 压缩分离出来的所有 css    new OptimizeCssAssetsPlugin({      cssProcessor: require('cssnano'), // 需要安装依赖 cssnano      cssProcessorOptions: {        discardComments: {removeAll: true}      },      canPrint: true // 是否将插件信息打印到控制台    })]

		* 构建过程如下截图，说明多进程起作用了：
		* 
		* webpack-happy 详细代码地址：https://github.com/isChosen/webpack-happy，欢迎下载查看，star 一下，感激不尽！


	* webpack-onDemand

		* 为什么要按需加载

			* 随着互联网的发展，一个网页承载的功能越来越多，采用单页面应用作为前端架构的网站会面临着网页需要加载的代码量很大的问题，因为许多功能都被集中整到一个 HTML 里，这会导致网页加载缓慢、交互卡顿，使用户体验非常糟糕。导致这个问题的根本原因在于一次性加载所有功能对应的代码，但其实用户在每个阶段只可能使用其中一部分功能，所以解决以上问题的方法就是用户当前需要用什么功能就只加载这个功能对应的代码，也就是所谓的按需加载。
		* 按需加载的原则

			* 将整个网站划分成一个个小功能，再按照每个功能的相关程度将他们分成几类；
			* 将每一类合并为一个 Chunk，按需加载对应的 Chunk；
			* 不要按需加载用户首次打开网站时需要看到的画面所对应的功能，将其放到执行入口所在的 Chunk 中，以减少用户能感知的网页加载时间；
			* 对于不依赖大量代码的功能点，例如依赖 echarts.js 去画图表、依赖 flv.js 去播放视频的功能点，可再对其进行按需加载；
			* 被分割出去的代码的加载需要一定的时机去触发，即当用户操作到了或者即将操作到对应的功能时再去加载对应的代码，被分割出去的代码的加载时机需要开发者根据网页的需求去衡量和确定；
			* 由于被分割出去进行按需加载的代码在加载的过程中也需要耗时，所以可以预估用户接下来可能会进行的操作，并提前加载对应的代码，让用户感知不到网络加载。
		* 思路理解

			* 在前端应用框架构建的单页面应用中，一般都要配置路由来呈现不同的视图，通常地，不同的路由对应不同的组件，相当于对应不同的页面，切换主路由可以看做是加载了另一个页面，加载了不同功能模块的代码。所以我们这里以路由作为分割点，按需加载不同功能模块的代码；
		* 项目结构

			* 重新整理了项目的目录结构。如下图：
			* 

			* 上图中，src 目录，只存放组件，静态资源和其他库文件都放在同级的 static 目录下。entry.jsx 和 index.jsx 都是项目入口，不同的是 index.jsx 是以对象的形式来配置路由，而 entry.jsx 是以路由标签的形式来配置路由的，因为 jsx 语法比较简单明了，所以本项目的入口文件是 entry.jsx 而不是 index.jsx。 感兴趣的可以对比下这两种写法；
		* 实现原理

			* 本节介绍以路由作为分割点来实现项目按需加载的性能优化，技术栈和版本号为：React@16.5.2、react-router@3.2.1 和 webpack@4+。react-router@4- 推荐使用 require.ensure() 方式配置路由按需加载，react-router@4+ 推荐使用 import(/**/) 方式配置按需加载。以路由作为分割点，所以配置路由所对应的组件就不能像往常那么书写了，component 要换成 getComponent，还需使用关键方法 require.ensure 来加载组件，entry.jsx 示例如下：

import React from 'react';import ReactDom from 'react-dom';import App from './components/App';import { Router, Route, IndexRoute, browserHistory } from 'react-router';// 提取加载组件的方法到一个配置文件（RouteConf.jsx）中，可使此文件更简洁const Login = (nextState, cb) => {    require.ensure([], require => {        cb(null, require('./components/Login').default);    }, 'chunk-login');}const Home = (nextState, cb) => {    require.ensure([], require => {        cb(null, require('./components/Home').default);    }, 'chunk-home');}const NoMatch = (nextState, cb) => {    require.ensure([], require => {        cb(null, require('./components/NoMatch').default);    }, 'chunk-nomatch');}const rootRoute = (    <Route path='/' component={App} >        <IndexRoute getComponent={Login}/>        <Route path='home' getComponent={Home} />        <Route path='*' getComponent={NoMatch} />    </Route>)ReactDom.render(    <Router routes={rootRoute} history={browserHistory} />,    document.getElementById('root'))

		* 扩展

			* Scope Hoisting

				* Scope Hoisting 可以让 webpack 打包出来的代码文件更小、运行更快。原理是它会分析模块之间的依赖关系，尽可能将被打散的模块合并到一个函数中，但前提是不能造成代码冗余。因此只有那些被引用了一次的模块才能被合并。开启 Scope Hoisting 后，代码在运行时因为创建的函数作用域变少了，所以内存开销也变小了；
				* Scope Hoisting 依赖源码时需采用 ES6 模块化语法，还需配置 mainFields。因为大部分 npm 中的第三方库采用 commonjs 语法，但部分库会同时提供两种语法模块化的代码，所以为了充分发挥 Scope Hoisting 的作用，需要增加以下配置：

resolve: {    mainFields: ["jsnext:main", "browser", "main"] // 配合 Scope Hoisting},plugins: [    new webpack.optimize.ModuleConcatenationPlugin(), // Scope Hoisting]


			* 输出分析

				* webpack-bundle-analyzer 可以很方便地让我们知道

					* 打包出的文件中都包含了什么；
					* 每个文件的尺寸在总体中的占比，让我们一眼看出哪些文件的尺寸大；
					* 模块之间的包含关系；
					* 每个文件 Gzip 后的大小。
				* 配置 webpack-bundle-analyzer 很简单，只要设置端口号即可。一般在 build-dev 时可以打开配置，在 server-dev 时，关闭配置，打开关闭就是注释掉！配置如下：

plugins: [    new BundleAnalyzerPlugin({        analyzerPort: 2018,        generateStatsFile: true // 是否需要输出分析文件，默认路径是 dist    })]



				* Scope Hoisting 开启前后对比，如下图。当你看到模块的依赖关系后，觉得某些第三方依赖(如react-router)比较大，可以考虑 split 提取分离出去或者弄成动态链接库等。截图如下：
				* 
				* 
		* webpack-onDemand 详细代码地址：https://github.com/isChosen/webpack-onDemand，欢迎下载查看，star 一下，感激不尽！
		* /
	* webpack-onDemand-v4
	* 输出分析
	* 配置建议
	* Dev: webpack.config.dev.whole.js
	* Pro: webpack.config.pro.whole.js


