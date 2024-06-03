// Defaults
import { Router } from "express";

// Product Controller
import { ProductController } from "../controller/productController";

// Product Validator
import { validate } from "../middleware/vaidate";

// ProductSchama 
import { productSchema } from "../schema/productSchema";

// Middlewares
import AuthMiddleware from "../middleware/auth";

// Product Router Instance
const productRouter: Router = Router();

// ProductController Object
const productController = new ProductController();

/**
 * Routes For User.
 * @name POST /all - List all available products.
 * @name POST /create - Creates a new product.
 * @name PUT /update/:id - Updates a specific product.
 * @name POST /delete/:id - delete a specific product.
 */
productRouter.get("/all", productController.getProducts);
productRouter.post(
  "/create",
  AuthMiddleware.restrictTo("customer"),
  validate(productSchema),
  productController.createProduct
);
productRouter.put(
  "/update/:id",
  AuthMiddleware.restrictTo("customer"),
  productController.updateProduct
);
productRouter.delete(
  "/delete/:id",
  AuthMiddleware.restrictTo("customer"),
  productController.deleteProduct
);

export { productRouter };
