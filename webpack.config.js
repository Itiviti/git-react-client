var webpack = require('webpack');
var path = require('path');
var isProduction = process.env.NODE_ENV === 'production';
var plugins = [
      new webpack.NoErrorsPlugin(),
      new webpack.ProvidePlugin({ 'fetch': 'imports?this=>global!exports?global.fetch!whatwg-fetch' })
    ];

if (!isProduction) plugins.push(new webpack.HotModuleReplacementPlugin());



module.exports = {  
    entry: {
        app: isProduction ? ['./js/app.js'] : ['webpack/hot/dev-server', './js/app.js']
    },
    output: {
        path: path.resolve(__dirname, isProduction ? './dist/' : './build'),
        filename: "bundle.js"
    },
    module: {
      loaders: [
        { test: /\.js$/, exclude: /node_modules/, loader: "babel", query: {presets:['react','es2015']}},
        { test: /\.css$/, loader: "style!css" }
      ]
    },
    plugins: plugins
};
