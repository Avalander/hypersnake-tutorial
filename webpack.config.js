const path = require('path')
const webpack = require('webpack')
const HtmlPlugin = require('html-webpack-plugin')

const src = path.resolve(__dirname, 'src')


module.exports = {
	mode: 'development',
	entry: {
		main: path.join(src, 'main.js'),
	},
	module: {
		rules: [{
			test: /\.js$/,
			exclude: /node_modules/,
			use: {
				loader: 'babel-loader',
				options: {
					presets: [[ 'env', {
						targets: {
							chrome: 67,
							firefox: 60,
						}
					}]],
					plugins: [
						'transform-object-rest-spread',
					],
				}
			}
		}]
	},
	plugins: [
		new HtmlPlugin({
			template: path.join(src, 'index.html'),
			filename: 'index.html',
		}),
		new webpack.HotModuleReplacementPlugin(),
		new webpack.NamedModulesPlugin(),
		new webpack.SourceMapDevToolPlugin(),
	],
	devServer: {
		compress: true,
		hot: true,
		stats: 'minimal',
	},
}