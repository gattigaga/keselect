const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const path = require('path')

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'keselect.min.js',
    library: 'Keselect',
    libraryTarget: 'umd',
    libraryExport: 'default'
  },
  module: {
    rules: [
      {
        test: /\.(css|s[ac]ss)$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ['**/*', '!index.html']
    }),
    new MiniCssExtractPlugin({
      filename: 'keselect.min.css'
    }),
    new CopyPlugin({
      patterns: [
        {
          from: './src/keselect.js',
          to: path.resolve(__dirname, 'dist/keselect.mod.js')
        },
        {
          from: './src/keselect.d.ts',
          to: path.resolve(__dirname, 'dist/keselect.mod.d.ts')
        }
      ]
    })
  ]
}
