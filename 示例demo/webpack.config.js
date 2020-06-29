const path = require("path")
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');


module.exports = {
    mode:'development',  // production || development
    entry:{
        index:"./app/static/js/entry/index.entry.js",
    },
    output:{
        filename:"js/[name].bundle.[hash:6].js",
        path:path.join(__dirname, "app/dist/"),
        chunkFilename: "js/[name].chunk.[hash:6].js",
        // publicPath: 'http://www.xxx.com'     // 设置公共路径，一般用来获取CDN上的资源等
    },
    module:{
        rules:[
            {
              test:/\.js$/,
              use:{
                loader:'babel-loader',
                options:{
                  // presets:[ '@babel/preset-env' ]
                  presets:[ ['@babel/preset-env', {
					  targets:{
						 edge: "17",
						 firefox: "60",
						 chrome: "67",
						 safari: "11.1",
						 android: "4.0"
					  },
					  corejs: 2, 
					  useBuiltIns: "usage"
				  }] ],
				  plugins: [
					"@babel/plugin-transform-runtime",
					{
						absoluteRuntime: false,
						corejs: false,
						helpers: true,
						regenerator: true,
						useESModules: false
					}
				  ]
                } 
              },
              include:path.resolve(__dirname, "app/static/js", "app/static/libs"),
              exclude:/node_modules/
            },
            {
                test:/\.css$/,
                use:[
                    MiniCssExtractPlugin.loader,  // 抽出CSS放进link标签内，不在放在style标签内, 有了这个就不需要style-loader了
                    // {
                    //     loader: 'style-loader',
                    //     options:{
                    //     insertAt:'top'
                    //     }
                    // },
                    'css-loader',
                    'postcss-loader',             //  会调用 postcss.config.js
					/** 如果没有 postcss.config.js
					 * {
					 *    loader: 'postcss-loader',
					 *    options: {
					 *	     plugins: (loader) => [ require('autoprefixer')(),  // css浏览器兼容 ]
					 *    }
					 * }
					 **/
					
                ]
            },
            {
                test:/\.less$/,
                use:[
                    // {
                    //   loader: 'style-loader',
                    //   options:{
                    //     insertAt:'top'
                    //   }
                    // },
                    MiniCssExtractPlugin.loader,  // 抽出CSS放进link标签内，不在放在style标签内
                    'css-loader',
                    'postcss-loader',
                    'less-loader'
                ]
            },
            {
                test:/\.(jpg|png|gif|jpeg|svg|eot|ttf|woff|woff2)$/,
                use:[{
                    loader:"file-loader",
                    options:{
                        name:'[name][hash:6].[ext]',
                        outputPath:'./img/',
                        publicPath:'dist/img/'
                    }
                }]
            },
            {
	            test: require.resolve('jquery'), 
	            use: [{
	                loader: 'expose-loader',
	                options: 'jQuery'
	            }, {
	                loader: 'expose-loader',
	                options: '$'
	            }]
	        }
        ]
    },
  
    plugins:[
        new HtmlWebpackPlugin({
            filename: __dirname + '/app/templates/base.html',
            template: './src/base.html',
            chunks: [],
            inject:'body',
            minify:{
              removeAttributeQuotes:true,  // 去除双引号
              collapseWhitespace:true,  // html压缩成一行
            }
        }),
        new HtmlWebpackPlugin({
            filename: __dirname + '/app/templates/index.html',
            template: './src/index.html',
            chunks: ['index','commons'],
            inject:'body' 
        }),
        new CleanWebpackPlugin(['app/dist', 'app/templates']),

        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            "window.jQuery": "jquery'",
            "window.$": "jquery"
        }),
        new webpack.HotModuleReplacementPlugin(), // 热更新，webpack自带，不支持抽离出来的css热更新，还有contenthash, chunkhash   
        new CopyWebpackPlugin([
            {from:'./static/models', to:'models'} // 拷贝到 ./dist目录下
        ]),
		new MiniCssExtractPlugin({
		    filename: "[name].css",
		    chunkFilename: "[id].css"
		}),
      
    ],
    optimization:{ // 优化项
        splitChunks: {
            cacheGroups: {
                commons: {
                    name: "commons",
                    chunks: "initial",
                    minChunks: 2,
                    minSize: 0
                }
            }
        },
        minimizer: [
          new UglifyJsPlugin({
            cache: true,
            parallel: true, // 并发打包
            sourceMap: true
          }),
          new OptimizeCss()
        ]
    },

    // npm install webpack-dev-server --save-dev
    devServer: {
        inline:true,
        hot:true,
		hotOnly: true, // 浏览器不会帮助我们在修改代码后自动刷新
        contentBase: path.resolve(__dirname, 'dist'), // 解析静态资源的目录
        host: 'localhost',
        port: 9090,
        compress: true,
        progress: true,
		proxy: { 
			"/api":{
				target: "http://192.168.11.12:8000"
			}
		}
    },

    // watch:true,            //不可与 devServer同时存在
    // watchOptions:{
    //     poll:1000,
    //     aggreatement:500,
    //     ignored: /node_modules/
    // },
    
}

/** 
 * npm install mini-css-extract-plugin -D  抽离CSS样式插件
 * 
 * let MiniCssExtractPlugin = require('mini-css-extract-plugin')
 * 
 * new MiniCssExtractPlugin({
 *    filename:'main.css'
 * })
 * 
 * 使用后需要自己压缩css js文件,
 * 
 * npm i optimize-css-assets-webpack-plugin -D
 * let OptimizeCss = require('optimize-css-assets-webpack-plugin')
 * 
 * optimization:{ // 优化项
 *      minimizer: [
 *        new OptimizeCss()
 *      ]
 *  },
 * 
 * npm install uglifyjs-webpack-plugin -D
 * 
 * let UglifyJsPlugin = require('uglifyjs-webpack-plugin')
*/


// npm i postcss-loader autoprefixer 自动添加css前缀
/** 
 * postcss.config.js
 * module.exports = {
 *   plugins:[require('autoprefixer')]
 * }
*/


// babel
/** 
 * ES6转ES5
 * npm install babel-loader@8.0.0-beta.0 @babel/core @babel/preset-env
 *
 * 解决 es6 转化 成es5后不能再低版本浏览器的问题
 * npm i -S @babel/polyfill
 * 可以再入口文件顶部引入 import "@babel/polyfill"; 但是会导致打包后的体积会很大。可以设置 useBuiltIns: "usage" 代替文件引入的方式。
 * 
 * 缺点：polyfill 是以全局变量的方式注入进来的, 会造成全局对象的污染. 因此想开发第三方的库，并开源的时候就不推荐使用 polyfill
 * 
 * 使用 @babel/plugin-transform-runtime 来解决polyfill的缺点
 * npm i --save-dev @babel/plugin-transform-runtime // 拓展
 * npm i -S @babel/runtime // 核心
 * 
*/


// 全局变量引用问题
/** 
 *  npm i expose-loader -D 将变量暴露全局的loader
 * 
 *  const webpack = require('webpack');
 *  rules:[{
	    test: require.resolve('jquery'), 
	    use: [
            {
                loader: 'expose-loader',
                options: 'jQuery'
            }, 
            {
                loader: 'expose-loader',
                options: '$'
            }   
        ]
    }],
    
    plugins:[
        new webpack.ProvidePlugin({   在每个模块都注入$
            $: 'jquery',
            jQuery: 'jquery',
            "window.jQuery": "jquery'",
            "window.$": "jquery"
        })
    ]
 * 
*/

// html 中的图片
/** 
 *  npm i html-withimg-loader -D
 * 
 */

/** 
 * source-map 方便调试代码     
 * NOTICE: 当使用了uglifyjs-webpack-plugin 插件时，sourceMap这个值的默认值是false，不开启map。如果要启用map，需要在插件中配置sourceMap值为true。
 * npm i html-withimg-loader -D
 * devtool: "source-map" // 会生成一个sourcemap文件，出错会标识错误的位置
 * devtool: "eval-source-map"  不会生成文件，但是可以显示 行和列
 * 推荐 cheap-module-eval-source-map  // 开发环境配置
 * 线上不推荐开启，会让人看见源码 cheap-module-source-map // 线上生成配置
 * 
 * module.exports = {
 *      entry:{}
 *      devtool: "source-map"
 * }
 */
