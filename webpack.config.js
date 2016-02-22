var webpack = require('webpack');
var path = require('path');
var isProduction = process.env.NODE_ENV === 'production';
var plugins = [
      new webpack.NoErrorsPlugin(),
      new webpack.ProvidePlugin({ 'fetch': 'imports?this=>global!exports?global.fetch!whatwg-fetch' }),
      new webpack.DefinePlugin({DEBUG: !isProduction})
    ];

if (!isProduction) plugins.push(new webpack.HotModuleReplacementPlugin());

module.exports = {  
    entry: {
        app: isProduction ? ['./js/app.tsx'] : ['webpack/hot/only-dev-server', './js/app.tsx']
    },
    output: {
        path: './reactgit',
        filename: 'bundle.js'
    },
    resolve: {
      // Add `.ts` and `.tsx` as a resolvable extension.
      extensions: ['', '.webpack.js', '.web.js', '.ts', '.tsx', '.js']
    },
    module: {
      loaders: [
        { test: /\.js$/, exclude: /node_modules/, loader: "babel", query: {presets:['react','es2015']}},
        { test: /\.css$/, loader: "style!css" },
        { test: /\.tsx?$/, loader: 'ts-loader' }
      ]
    },
    plugins: plugins,
    devServer: {
      historyApiFallback: true
    }
};
