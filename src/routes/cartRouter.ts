// Defaults
import { Router } from "express";

//Cart Controller
import { CartController } from "../controller/cartController";

// Cart Router Instance
const cartRouter: Router = Router();

// Cart Controller Object
const cartController = new CartController();

/**
 * Routes For User.
 * @name GET /getItems - Get all Items from cart.
 * @name POST /addTocart - Add a new product to cart.
 */
cartRouter.get("/getItems", cartController.getCartItems);
cartRouter.post("/addTocart", cartController.addToCart);
cartRouter.delete("/removeTocart/:id", cartController.removeToCart);

export { cartRouter };
