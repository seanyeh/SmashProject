module.exports = {
    devtool: "source-map",
    entry: "./src/entry.js",
    output: {
        path: __dirname + "/www",
        filename: "bundle.js"
    },
    module: {
        rules: [
            {
                include: __dirname + "/src/",
                test: /\.scss$/,
                use: ["style-loader", "css-loader", "sass-loader"],
            },
            {
                include: __dirname + "/src/",
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
            },
            {
                include: __dirname + "/images/",
                test: /\.(jpe?g|png|gif|svg)$/i,
                use: [
                    'file-loader?hash=sha512&digest=hex&name=[hash].[ext]',
                    'image-webpack-loader?bypassOnDebug'
                ]
            },
            {
                include: __dirname + "/src/",
                test: /\.(png|woff|woff2|eot|ttf|svg)$/,
                use: ['url-loader?limit=100000']
            }
        ]
    },

    devServer: {
        contentBase: "./www/"
    }
};
