# Webpack

## Context

资源入口的路径前缀, 在配置是必须使用**绝对路径**的形式, 主要目的是让entry的编写更加简洁。

``` js
module.exports = {
	context: path.join(__dirname, './src'),
	entry: './script/index.js',
	output: {
		filename: 'bundle.js'
	},
	mode: 'development',
  devServer: {
    publicPath: /dist'
  }
}

module.exports = {
	context: path.join(__dirname, './src/script'),
	entry: './index.js',
	output: {
		filename: 'bundle.js'
	},
	mode: 'development',
  devServer: {
    publicPath: /dist'
  }
}
```

## 入口

```js
	module.exports = {
		entry: './src/index.js',
		entry: ['babel-polyfill', './src/index.js'], //数组类型入口的作用是将多个资源预先合并, 在打包的时候 webpack 会将arr中最后一个元素作为实际的入口路径
		entry: { // 多入口
			index: './src/index.js',
			lib: ['babel-polyfill', './src/hack.js']
		}
	}
	
```

### 单页应用

`vendor` + `optimization.splitChunks`

### 多页应用

```js
module.exports = {
	entry: {
		pageA: './src/pageA.js',
		pageB: './src/pageB.js',
		pageC: './src/pageC.js',
		vendor: ['react', 'react-dom']
	}
}

/** 
 * 将react 和 react-dom 打包进vendor, 之后再配置optimization.splitChunks
*/

```

## 出口

```js
	const path = require('path');
	module.exports = {
		entry: './src/app.js',
		output: {
			filename: 'bundle.js',
			path: path.join(__dirname, 'assets'),
			publicPath: /dist/
		}
	}

```

### filename

* `[hash]` Webpack 此次打包所有资源生成的hash
* `[chunkhash]` 当前chunk内容的hash
* `[id]` 当前chunk的id
* `[query]` filename中配置的query

### path

必须为**绝对路径**

webpack4之后的版本中,  output.path默认为dist目录, 除非需要更改, 否则不必单独配置

### publicPath

非常重要的配置项, 与path容易混, path从功能上说: path用来指定输出位置. publicPath用来指定资源的请求位置. 

假设 当前html地址为https://a.com/app/index.html, 异步加载文件0.chunk.js

		publicPath: '' // 实际路径 http://a.com/app/0.chunk.js
		publicPath: './js' // 实际路径 http://a.com/app/js/0.chunk.js
		publicPath: '../assets' // 实际路径 http://a.com/assets/0.chunk.js

## lodader

### babel-loader 
	
		处理 ES6+ 并将其编译为 ES5

`npm i babel-loader @babel/core @babel/preset-env`

- babel-loader: 使babel与webpackx协同工作的模块
- @babel/core: babel编译的核心模块
- @babel/preset-env: babel官方推荐的预置器, 可根据用户设置的目标环境自动添加所需的插件和补丁来编译ES6+代码

**注意**

```js
rules:[{
	test: /\.js$/,
	exclude: /node_modules/,
	use: {
		loader: 'babel-loader',
		options: {
			cacheDirectory: true,
			presets: [[
				'env', { modules: false }
			]]
		}
	}
}]

/** 
 * 1. 需要在exclude中添加node_modules
 * 2. 添加了cacheDirectory, 会启用缓存机制, 在重复打包未改变过的模块时防止二次编译
 * 3。 @babel/preset-env会将ES6 Moudle 转化为 CommonJS的形式, 这会导致webpack中的tree-shaking特性失效
 * 
 * 也可将presets和plugins从webpack配置文件中提取出来到 .babelrc
*/

```

### ts-loader

```js
	rules: [
		{
			test: /\.tsx?$/,
			use: 'ts-loader'
		}
	]
```	
		注意: TS本身的配置并不在ts-loader中, 而是必须要放在工程目录下的tsconfig.json中, 如: 

```json
	{
		"compilerOptions": {
			"target": "es5",
			"sourceMap": true
		}
	}
```

### html-loader

		会将html转换成字符串, 并通过document.write插入到页面中

``` js
	rules: [{
		test: /\.html$/,
		use: 'html-loader'
	}]
```

### handlebars-loader

### file-loader

		打包文件类型的资源, 并返回其publicPath

``` js
	rules: [{
		test: /\.(png|jpg|gif)$/,
		use: 'file-loader'
	}]
```

配置以上就可以在js中引入图片了

### url-loader

```js
	rules: [{
		test: /\.(png|jpg|gif)$/,
		use: {
			loader: 'url-loader',
			options: {
				limit: 10240,
				name: [name].[ext],
				publicPath: './assets-path/
			}
		}
	}]
```


### vue-loader

		vue-loader可以将组件的模板, js及样式进行拆分. 
		安装时, 除了 vue, vue-loader之外, 还要安装vue-template-compiler来编译Vue模板
		以及css-loader来处理样式

### 自定义loader

## source-map

		便于开发者在浏览器控制台查看源码

## 样式

### mini-css-extract-plugin

		提取样式到css文件, 支持按需加载css

``` js
	module.exports = {
		module: {
			rules: [
				{
					test: /\.css$/,
					use: [
						{
							loader: MiniCssExtractPlugin.loader,
							option: {
								publicPath: '../'
							}
						},
						'css-loader'
					]
				}
			]
		},
		plugins: [
			new MiniCssExtractPlugin({
				filename: '[name].css',
				chunkFilename: '[id].css'
			})
		]
	}
```

### postCSS

#### 自动前缀

		PostCSS最广泛的一个应用场景就是与Autoprefixer结合, 为css添加前缀

`npm i autoprefixer`

```js
	const autoprefixer = require('autoprefixer');
	plugin: [
		autoorefixer({
			grid: true,
			browser: [
				'> 1%',
				'last 3 versions',
				'ie8'
			]
		})
	]

```

### stylelint

		css 质量检测工具

```js
	plugins: [
		stylelint: ({
			config: {
				rules: {
					'declaration-no-important': true
				}
			}
		})
	]
```

### CSSNext

		PostCSS可以与CSSNext结合使用, 让我们在应用中使用CSS语法特性

`npm i postcss-cssnext`

```js
	const postcssCssnext = require('postcss-cssnext');
	plugins: [
		postcssCssnext({
			borwser:{
				'> 1%'
			}
		})
	]
```

### CSS Modules

		只需要开启css-loader中的modules配置

```js
// localIdentName 用于指明css代码中类名如何来编译
rules: [
	{
		test: /\.css$/,
		use: [
			'style-loader',
			{
				loader: 'css-loader',
				options: {
					modules: true,
					localIdentName: '[name]__[local]__[hase:base64:5]'
				}
			}
		]
	}
]
```

## 代码分片

### SplitChunks



## 配置环境

		mode 环境变量 chunk hash 版本号

### source-map

``` js
	module.exports = {
		devtool: 'source-map', // 
		module: {
			rules: [
				test: /\.scss$/,
				use: [
					'style-loader',
					{
						loader: 'css-loader',
						options: {  //
							sourceMap: true
						}
					},
					{
						loader: 'sass-loader', 
						options: {  //
							sourceMap: true
						}
					}
				]
			]
		}
	}
```

### 安全

		hidden-source-map 及 nosources-source-map

## 资源压缩

### 压缩javascript

		config.optimization.minimize 
		webpack4 默认使用了terser-webpack-plugin

``` js
	module.exports = {
		optimization: {
			minimize: true // 如果配置了 mode: production, 则不需要人为设置
		}
	}

```

### 压缩css

		压缩css文件的前提是使用extract-text-webpack-plugin或mini-css-extract-plugin 将样式提取出来, 接着使用 optimize-css-assets-webpack-plugin来进行压缩

		7.5.2

## 缓存

### 资源hash

### bundle体积监控和分析

`webpack-bundle-analyzer` 能够帮助我们分析一个bundle的构成, 能够生成一张bundle的模块组层结构图

``` js
const Analyzer = reuqire('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
	plugin: [
		new Analyzer()
	]
}
```

最后, 还需要自动化对资源体积进行监控, `bundlesize`这个工具包可以做到这一点. 安装之后只要在package.json中进行一下配置即可

``` json
{
	"name": "app",
	"bundlesize": [
		{
			"path": "./bundle.js",
			"maxSize": "50 kB"
		}
	],
	"script": {
		"test:size": "bundlesize"
	}
}
```

## **打包优化**

		首先重述一条软件工程领域的经验: 不要过早优化。
		项目初期, 不要看到任何优化点就拿来加到项目中。
		这不但增加了复杂度, 优化效果也不太理想。
		一般是当项目发展到一定规模后, 性能问题随之而来, 这时在对症下药。

### HappyPack

		通过多线程来提升webpack打包的工具

### 缩小打包作用域

exclude include

### noParse

		有些库是我们希望webpack完全不需要解析的, 可以使用noParse忽略

```js
module.exports = {
	module: {
		noParse: /lodash/
	}
}
```

### IgnorePlugin

		exclude 和 include 是确定loader的规则范围
		noParse是不去解析但仍会打包到bundle中
		IgnorePlugin可以完全排除一些模块, 被排除的模块即使被引用也不会被打包到资源文件中

``` js
	plugins: [
		new webpack.IgnorePlugin({
			resourceRegExp: /^\.\/locale$/, // 匹配资源文件
			contextRegExp: /moment$/ // 匹配检索目录
		})
	]
```

## 动态链接库与DLLPlugin



## 开发环境调优

### webpack-dashboard

		webpack构建结束后都会在控制台输出一些打包相关信息
		但是这些信息是以列表形式展现的, 有时不够直观
		webpack-dashboard能更好的展现这些信息

`npm i webpack-dashboard`

``` js
const DashBoardPlugin = require('webpack-dashboard/plugin')

module.exports = {
	plugins: [
		new DashBoardPlugin();
	]
}
```

还需要改变下webpack的启动方式

```json
scripts: {
	"dev": "webpack-dashboard -- webpack-dev-server"
}
```

### webpack-merge

		对本地环境/测试环境/生成环境公共部分的配置部分抽离出来

### speed-measure-webpack-plugin

		觉得webpack构建很慢但有不清楚如何下手优化?

### size-plugin

		每次执行webpack打包后, size-plugin都会输出本次构建的资源体积（gzip后）
		以及与上次构建相比体积变化了多少

```js
plugins: [
	new SizePlugin()
]
```

## 模块热替换

		要确保项目时基于webpack-dev-server或webpack-dev-middle进行开发的

```js
plugins: [
	new webpack.HotModuleReplacementPlugin()
]
devServer: {
	hot: true
}

```