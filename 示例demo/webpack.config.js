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
                  presets:[
                    '@babel/preset-env'
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
                    'postcss-loader'             //  会调用 postcss.config.js
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
        new webpack.HotModuleReplacementPlugin(), // 热更新，热更新不是刷新
        new CopyWebpackPlugin([
            {from:'./static/models', to:'models'} // 拷贝到 ./dist目录下
        ])
      
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
        contentBase: path.resolve(__dirname, 'dist'),
        host: 'localhost',
        port: 9090,
        compress: true,
        progress: true
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


// ES6转ES5
/** 
 * npm install babel-loader@8.0.0-beta.0 @babel/core @babel/preset-env
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
 * 
 * module.exports = {
 *      entry:{}
 *      devtool: "source-map"
 * }
 */
