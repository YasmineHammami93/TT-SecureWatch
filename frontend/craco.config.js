const webpack = require('webpack');

module.exports = {
  webpack: {
    plugins: {
      add: [
        new webpack.HotModuleReplacementPlugin(),
      ],
    },
  },
};
