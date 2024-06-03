//Defaults
import express from "express";
import dotenv from "dotenv";
import { createProxyMiddleware } from "http-proxy-middleware";

//Load the Environment varialbes
dotenv.config();
  
// Express Instance
const app = express();

/* Importing Middlewares */
import AuthMiddleware from "../src/middleware/auth";

/* Importing Routes */
import { userRouter } from "./routes/userRouter";
import { productRouter } from "./routes/productRouter";

/* Importing Connection */
import { connectDb } from "../src/config/db";
import { cartRouter } from "./routes/cartRouter";
import { paymentRouter } from "./routes/paymentRouter";

/* Middleware */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* Setting up the proxy */
app.use(
  "/external/user",
  createProxyMiddleware({
    target: "http://localhost:3000/user/signup",
    changeOrigin: true,
  })
);

app.use(
  "/external/product",
  createProxyMiddleware({
    target: "http://localhost:3000/product/all/",
    changeOrigin: true,
  })
);


/* Routes For User */
app.use("/user", userRouter);
app.use("/cart", AuthMiddleware.authenticateToken, cartRouter);
app.use("/product", AuthMiddleware.authenticateToken, productRouter);
app.use("/payments", AuthMiddleware.authenticateToken, paymentRouter);
app.use("/order", paymentRouter);
app.use("/invoice", AuthMiddleware.authenticateToken, paymentRouter);

/*Setting up the Database Connection */
(async () => {
  try {
    await connectDb();
    app.listen(process.env.port || 4000);
    console.log("DB and Server Started");
  } catch (error) {
    console.log("Error Occured While Starting Server And Db", error);
  }
})();
