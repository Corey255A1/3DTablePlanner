const path = require('path');
module.exports = {
    entry: {
        RoomPlanner: './src/RoomPlannerMain.ts'
    },
    output: {
        path: path.resolve(__dirname, 'www/scripts/'),
        filename: '[name].js',
        library: '[name]',
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    devtool: 'source-map',
    plugins: [

    ],
    devServer: {
        static:{
            directory: "./www"
        },
        hot: false
    },
    mode:'development',
    module: {
        rules: [{
            test: /\.tsx?$/,
            loader: 'ts-loader',
            exclude: /node_modules/
        }]
    }
}