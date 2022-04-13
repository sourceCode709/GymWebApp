// eslint-disable-next-line @typescript-eslint/no-var-requires
// const { GenerateSW } = require("workbox-webpack-plugin");

module.exports = {
  publicPath: process.env.NODE_ENV === "development" ? "/vuejs-pwa/" : "",

  // configureWebpack: {
  //   plugins: [new GenerateSW()],
  // },

  // pwa: {
  //   workboxPluginMode: "InjectManifest",
  //   workboxOptions: {
  //     swSrc: "src/service-worker.js",
  //   },
  // },
};
