
https://stackoverflow.com/questions/20351637/how-to-create-a-simple-http-proxy-in-node-js


/*Custom */

// app.ts

const express = require("express");
const http = require("http");

const app = express();

// Define proxy routes
app.use("/external/user", createProxy("/api/user"));
app.use("/external/cart", createProxy("/api/cart"));
app.use("/external/product", createProxy("/api/product"));

app.listen(4000, () => {
  console.log("Proxy server is running on port 4000");
});

// Custom proxy function
function createProxy(targetPath) {
  return (req, res) => {
    const options = {
      hostname: "localhost",
      port: 3000,
      path: targetPath + req.url,
      method: req.method,
      headers: req.headers,
    };

    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });

    req.pipe(proxyReq, { end: true });
  };
}

//From Stack overflow.

function onRequest(client_req, client_res) {
  console.log("serve: " + client_req.url);

  var options = {
    hostname: "www.google.com",
    port: 80,
    path: client_req.url,
    method: client_req.method,
    headers: client_req.headers,
  };

  var proxy = http.request(options, function (res) {
    client_res.writeHead(res.statusCode, res.headers);
    res.pipe(client_res, {
      end: true,
    });
  });

  client_req.pipe(proxy, {
    end: true,
  });
}

/* Using Existing Package */

// app.ts

const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

// Define proxy routes with rewrite
app.use(
  "/external/user",
  createProxyMiddleware({
    target: "http://localhost:3000",
    changeOrigin: true,
    pathRewrite: {
      "^/external/user": "/api/user", // Rewriting /external/user to /api/user
    },
  })
);

app.use(
  "/external/cart",
  createProxyMiddleware({
    target: "http://localhost:3000",
    changeOrigin: true,
    pathRewrite: {
      "^/external/cart": "/api/cart", // Rewriting /external/cart to /api/cart
    },
  })
);

app.use(
  "/external/product",
  createProxyMiddleware({
    target: "http://localhost:3000",
    changeOrigin: true,
    pathRewrite: {
      "^/external/product": "/api/product", // Rewriting /external/product to /api/product
    },
  })
);

app.listen(4000, () => {
  console.log("Proxy server is running on port 4000");
});
