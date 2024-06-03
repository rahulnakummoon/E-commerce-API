const express = require("express");
const http = require("http");
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

app.use(
  "/external/product",
  createProxyMiddleware({
    target: "http://localhost:3000/product/all", // Target with specific path (working approach)
    changeOrigin: true,
    pathRewrite: {
      "^/external/product": "/product/all",
    },
  })
);


// app.use("/external/user", createProxy("/api/user"));
// app.use("/external/cart", createProxy("/api/cart"));
// app.use("/external/product", createProxy("/product"));

app.listen(4000, () => {
  console.log("Proxy server is running on port 4000");
});

// function createProxy(targetPath) {
//   return (req, res) => {
//     const options = {
//       hostname: "localhost",
//       port: 3000, 
//       path: targetPath + req.url,
//       method: req.method,
//       headers: req.headers,
//     };
//     console.log('this is req.url',req.url);

//     console.log('this is options', options.path);
//     const proxyReq = http.request(options, (proxyRes) => {
//       res.writeHead(proxyRes.statusCode, proxyRes.headers);
//       proxyRes.pipe(res, { end: true });
//     });
//     req.pipe(proxyReq, { end: true });
//   };
// }
