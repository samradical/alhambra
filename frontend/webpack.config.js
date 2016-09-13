const {
  join,
  resolve
} = require('path')

const constants = require('./webpack.constants')

const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const autoprefixer = require('autoprefixer');
const postcssEasings = require('postcss-easings');


const DefineENV = new webpack.DefinePlugin({
  'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
})

const CSS_LOADERS = {
  css: '',
  scss: '!sass-loader'
};


module.exports = env => {
  const isDev = !!env.dev
  const isProd = !!env.prod
  const isTest = !!env.test
  console.log("--------------");
  console.log(isDev, isProd, isTest);
  console.log("--------------");
  const addPlugin = (add, plugin) => add ? plugin : undefined
  const ifDev = plugin => addPlugin(env.dev, plugin)
  const ifProd = plugin => addPlugin(env.prod, plugin)
  const ifNotTest = plugin => addPlugin(!env.test, plugin)
  const removeEmpty = array => array.filter(i => !!i)

  const stylesLoaders = () => {
    return Object.keys(CSS_LOADERS).map(ext => {
      const prefix = 'css-loader!postcss-loader';
      const extLoaders = prefix + CSS_LOADERS[ext];
      const loader = isDev ? `style-loader!${extLoaders}` : ExtractTextPlugin.extract('style-loader', extLoaders);
      return {
        loader,
        test: new RegExp(`\\.(${ext})$`),
      };
    });
  }

  return {
    entry: {
      app: './app.js',
      vendor: ['react', 'react-dom', 'lodash']
    },
    output: {
      filename: 'bundle.[name].[chunkhash].js',
      path: constants.DIST,
      pathinfo: !env.prod,
    },
    context: constants.SRC_DIR,
    devtool: env.prod ? 'source-map' : 'eval',
    devServer: {
      host:'0.0.0.0',
      inline: true,
      hot: true,
      stats: {
        colors: true
      },
      contentBase: constants.SRC_DIR,
      historyApiFallback: !!env.dev,
      port: 8080
    },
    bail: env.prod,
    module: {
      loaders: [{
        test: /\.svg$/,
        loader: 'svg-inline'
      }, {
        loader: 'url-loader?limit=100000',
        test: /\.(gif|jpg|png)$/
      }, {
        loader: 'url-loader?limit=100000',
        test: /\.(ttf|eot|woff(2)?)(\?[a-z0-9]+)?$/,
        include: [`${join(constants.ASSETS_DIR, '/font/')}`]
      }, {
        test: /\.json$/,
        loader: 'json'
      }, {
        test: /\.js$/,
        loader: 'babel',
        exclude: /node_modules/,
      }].concat(stylesLoaders()),
    },
    sassLoader: {
      includePaths: [
        join(constants.SRC_DIR, '/base'),
        join(constants.SRC_DIR, '/base/vars')
      ],
    },
    plugins: removeEmpty([
      new webpack.DefinePlugin({
        'process.env': {
          //APP_DOMAIN:'"/"',
          APP_DOMAIN: '"/alhambra/test01"',
          ASSETS_DIR: '"https://storage.googleapis.com/samrad-alhambra/www-assets/"',
          //ASSETS_DIR : '""',
          REMOTE_ASSETS_DIR: '"https://storage.googleapis.com/samrad-alhambra/www-assets/"'
        }
      }),
      new HtmlWebpackPlugin({
        template: './index.html'
      }),
      ifProd(new ExtractTextPlugin('[name]-[hash].css', {
        allChunks: true
      })),
      ifProd(new webpack.optimize.DedupePlugin()),
      ifProd(new webpack.LoaderOptionsPlugin({
        minimize: true,
        debug: false,
        quiet: true,
      })),
      // saves 65 kB with Uglify!! Saves 38 kB without
      DefineENV,
      // saves 711 kB!!
      ifProd(new webpack.optimize.UglifyJsPlugin({
        compress: {
          screw_ie8: true, // eslint-disable-line
          warnings: false,
        },
      })),
      ifNotTest(new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor'
      })),
      ifNotTest(new webpack.optimize.CommonsChunkPlugin({
        name: 'common',
        fileName: 'bundle.common.js'
      }))
    ]),
    postcss: () => [
      autoprefixer({
        browsers: [
          'last 2 versions',
          'iOS >= 8',
          'Safari >= 8',
        ]
      }),
      postcssEasings
    ],
  }
}
