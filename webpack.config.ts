import * as path from "path";
import { Configuration } from "webpack";
import CopyWebpackPlugin from 'copy-webpack-plugin';
//@ts-ignore
import HtmlWebpackPlugin from 'html-webpack-plugin';
import 'webpack-dev-server';

const config: Configuration = {
	entry: "./src/main.tsx",
	module: {
		rules: [
			{
				test: /\.(ts|tsx|js|jsx)?$/,
				exclude: /node_modules/,
				use: {
					loader: "babel-loader",
					options: {
						presets: [
							"@babel/preset-env",
							"@babel/preset-typescript",
							"@babel/preset-react"
						],
					},
				},
			},
            {
				test: /\.(jpg|png|gif|svg)$/,
				use: {
					loader: 'file-loader',
					options: {
						outputPath: 'assets/images/'
					}
				}
			},
			{
			  test: /\.css$/i,
			  use: ["style-loader", "css-loader"],
			},
		],
	},
	resolve: {
		extensions: [".ts", ".tsx", ".js", ".jsx"],
	},
	output: {
		path: path.resolve(__dirname, "dist"),
		filename: "bundle.js",
	},
	devServer: {
		static: path.join(__dirname, "dist"),
		compress: true,
		port: 3000
	},
	plugins: [
		new CopyWebpackPlugin({
			patterns: [
				{ from: 'static' }
			]
		}),
		new HtmlWebpackPlugin({
			template: 'src/index.html'
		})
	]
};

export default config;