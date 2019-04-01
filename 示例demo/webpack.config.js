const path = require("path")
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin');


module.exports = {
    mode:'development',  // production || development
    entry:{
        index:"./app/static/js/entry/index.entry.js",
    },
    output:{
        filename:"js/[name].bundle.[hash:6].js",
        path:path.join(__dirname, "app/dist/"),
        chunkFilename: "js/[name].chunk.[hash:6].js"
    },
    module:{
        rules:[
            {
              test:/\.js$/,
              use:{
                loader:'babel-loader',
                options:{
                  preset:[
                    '@babel/preset-env'
                  ]
                }
              }
            },
            {
                test:/\.css$/,
                use:[
                  // {
                  //   loader: 'style-loader',
                  //   options:{
                  //     insertAt:'top'
                  //   }
                  // },
                  MiniCssExtractPlugin.loader,  // 抽出CSS放进link标签内，不在放在style标签内
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
    
    devServer: {
        inline:true,
        hot:true,
        contentBase: path.resolve(__dirname, 'dist'),
        host: 'localhost',
        port: 9090,
        compress: true,
        progress: true
    }
    
}

// npm install mini-css-extract-plugin -D  抽离CSS样式插件

/** 
 * let MiniCssExtractPlugin = require('mini-css-extract-plugin')
 * 
 * new MiniCssExtractPlugin({
 *    filename:'main.css'
 * })
 * 
 * 使用后需要自己压缩css js文件,
 * 
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
