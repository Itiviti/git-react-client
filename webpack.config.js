var webpack = require('webpack');  
module.exports = {  
    entry: [
      'webpack/hot/only-dev-server',
      "./js/app.tsx"
    ],
    output: {
        path: __dirname + '/build',
        filename: "bundle.js"
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
    plugins: [
      new webpack.NoErrorsPlugin(),
      new webpack.ProvidePlugin({ 'fetch': 'imports?this=>global!exports?global.fetch!whatwg-fetch' })
    ],
    devServer: {
          historyApiFallback: true
    }


};
