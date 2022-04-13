// if (!self.define) {
//   const e = (e) => {
//       "require" !== e && (e += ".js");
//       let i = Promise.resolve();
//       return (
//         n[e] ||
//           // eslint-disable-next-line no-async-promise-executor
//           (i = new Promise(async (i) => {
//             if ("document" in self) {
//               const n = document.createElement("script");
//               (n.src = e), document.head.appendChild(n), (n.onload = i);
//               // eslint-disable-next-line no-undef
//             } else importScripts(e), i();
//           })),
//         i.then(() => {
//           if (!n[e]) throw new Error(`Module ${e} didn’t register its module`);
//           return n[e];
//         })
//       );
//     },
//     i = (i, n) => {
//       Promise.all(i.map(e)).then((e) => n(1 === e.length ? e[0] : e));
//     },
//     n = { require: Promise.resolve(i) };
//   self.define = (i, c, r) => {
//     n[i] ||
//       (n[i] = Promise.resolve().then(() => {
//         let n = {};
//         const o = { uri: location.origin + i.slice(1) };
//         return Promise.all(
//           c.map((i) => {
//             switch (i) {
//               case "exports":
//                 return n;
//               case "module":
//                 return o;
//               default:
//                 return e(i);
//             }
//           })
//         ).then((e) => {
//           const i = r(...e);
//           return n.default || (n.default = i), n;
//         });
//       }));
//   };
// }
// // eslint-disable-next-line no-undef
// define("./service-worker.js", ["./workbox-543be79b"], function (e) {
//   "use strict";
//   self.addEventListener("message", (e) => {
//     e.data && "SKIP_WAITING" === e.data.type && self.skipWaiting();
//   }),
//     e.precacheAndRoute(
//       [
//         { url: "css/app.601d2ada.css", revision: null },
//         { url: "css/chunk-vendors.8e96ff5b.css", revision: null },
//         { url: "favicon.ico", revision: "1ba2ae710d927f13d483fd5d1e548c9b" },
//         {
//           url: "img/icons/android-chrome-192x192.png",
//           revision: "f130a0b70e386170cf6f011c0ca8c4f4",
//         },
//         {
//           url: "img/icons/android-chrome-512x512.png",
//           revision: "0ff1bc4d14e5c9abcacba7c600d97814",
//         },
//         {
//           url: "img/icons/android-chrome-maskable-192x192.png",
//           revision: "845a39478d0e2d4d5d32a092de2de250",
//         },
//         {
//           url: "img/icons/android-chrome-maskable-512x512.png",
//           revision: "2695f5feb66cdb0c6f09d0e415824cf9",
//         },
//         {
//           url: "img/icons/apple-touch-icon-120x120.png",
//           revision: "936d6e411cabd71f0e627011c3f18fe2",
//         },
//         {
//           url: "img/icons/apple-touch-icon-152x152.png",
//           revision: "1a034e64d80905128113e5272a5ab95e",
//         },
//         {
//           url: "img/icons/apple-touch-icon-180x180.png",
//           revision: "c43cd371a49ee4ca17ab3a60e72bdd51",
//         },
//         {
//           url: "img/icons/apple-touch-icon-60x60.png",
//           revision: "9a2b5c0f19de617685b7b5b42464e7db",
//         },
//         {
//           url: "img/icons/apple-touch-icon-76x76.png",
//           revision: "af28d69d59284dd202aa55e57227b11b",
//         },
//         {
//           url: "img/icons/apple-touch-icon.png",
//           revision: "66830ea6be8e7e94fb55df9f7b778f2e",
//         },
//         {
//           url: "img/icons/favicon-16x16.png",
//           revision: "4bb1a55479d61843b89a2fdafa7849b3",
//         },
//         {
//           url: "img/icons/favicon-32x32.png",
//           revision: "98b614336d9a12cb3f7bedb001da6fca",
//         },
//         {
//           url: "img/icons/msapplication-icon-144x144.png",
//           revision: "b89032a4a5a1879f30ba05a13947f26f",
//         },
//         {
//           url: "img/icons/mstile-150x150.png",
//           revision: "058a3335d15a3eb84e7ae3707ba09620",
//         },
//         {
//           url: "img/icons/safari-pinned-tab.svg",
//           revision: "4e857233cbd3bb2d2db4f78bed62a52f",
//         },
//         {
//           url: "img/logo.82b9c7a5.png",
//           revision: "82b9c7a5a3f405032b1db71a25f67021",
//         },
//         { url: "index.html", revision: "b1997d673ad17c526d7279dc4b621065" },
//         { url: "js/app.aa83d143.js", revision: null },
//         { url: "manifest.json", revision: "b9cd45b3e6c68619e62006b4457dc243" },
//         {
//           url: "precache-manifest.d705fd9d7e0169dc805b42f10dee4795.js",
//           revision: "d705fd9d7e0169dc805b42f10dee4795",
//         },
//         { url: "robots.txt", revision: "b6216d61c03e6ce0c9aea6ca7808f7ca" },
//         {
//           url: "service-worker.js",
//           revision: "787167315c022f7d00a0054dcfa531b1",
//         },
//         {
//           url: "static/icons/144.png",
//           revision: "b89032a4a5a1879f30ba05a13947f26f",
//         },
//         {
//           url: "static/icons/512.png",
//           revision: "0ff1bc4d14e5c9abcacba7c600d97814",
//         },
//       ],
//       {}
//     );
// });
//# sourceMappingURL=service-worker.js.map
