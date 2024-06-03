// Defaults
import { Request, Response } from "express";

// Responses Types
import { sendErrorResponse, successResponse } from "../utills/responseHandler";

// Logger
import logger from "../utills/logger";

// Models
import ProductModel from "../models/productModel";
import CartModel from "../models/cartModel";

//ErrorHandler
import { handleError } from "../utills/errorHandler";

//Constants
import {
  CartMessages,
  PaymentMessage,
  ProductMessage,
} from "../utills/constants";

export class CartController {
  /**
   * Retrieves  cart items from the database.
   *
   * @param {Request} req - The request object contains user info.
   * @param {Response} res - The response object.
   * @returns {Promise<Response>} A promise that resolves to a response object.
   */
  getCartItems = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = req.user.id;
      const cartItems = await CartModel.find({ cart_user: userId });

      logger.info("Listing All Products", cartItems);
      return successResponse(res, 200, "product", cartItems);
    } catch (error) {
      return handleError(res, "cart", "User", CartMessages.GetItemsError);
    }
  };

  /**
   * Adds a product to the cart.
   *
   * @param {Request} req - The request object.
   * @param {string} req.body.product_id - Product Id to add in cart.
   * @param {string} req.body.quantity - Quantity Of the product to add in a cart.
   * @param {Response} res - The response object.
   * @returns {Promise<Response>} A promise that resolves to a response object.
   */
  addToCart = async (req: Request, res: Response): Promise<Response> => {
    const { product_id, quantity } = req.body;

    if (!product_id || !quantity) {
      return sendErrorResponse(
        res,
        404,
        CartMessages.ProductIdAndQuantityRequired
      );
    }

    const product_exist = await ProductModel.findById({ _id: product_id });

    if (!product_exist) {
      sendErrorResponse(res, 404, ProductMessage.NotFound);
      return;
    }

    const cart_details = await CartModel.findOne({ cart_user: req.user.id });

    if (!cart_details) {
      const newCart = new CartModel({
        products: [
          {
            product_id: product_exist.id,
            quantity: quantity,
            price: product_exist.product_price * Number(quantity),
          },
        ],
        cart_user: req.user.id,
        total_price: product_exist.product_price * quantity,
      });

      await newCart.save();
      return successResponse(
        res,
        201,
        JSON.parse(JSON.stringify(newCart, null))
      );
    } else {
      const productIndex = cart_details.products.findIndex(
        (product) =>
          product.product_id.toString() === product_exist.id.toString()
      );

      if (productIndex > -1) {
        cart_details.products[productIndex].quantity += Number(quantity);
        cart_details.products[productIndex].price +=
          product_exist.product_price * Number(quantity);
        cart_details.total_price +=
          product_exist.product_price * Number(quantity);
      } else {
        cart_details.products.push({
          product_id: product_exist.id,
          quantity: quantity,
          price: product_exist.product_price * Number(quantity),
        });
        cart_details.total_price += product_exist.product_price * quantity;
      }
    }
    await cart_details.save();
    return successResponse(
      res,
      200,
      JSON.parse(JSON.stringify(cart_details, null))
    );
  };

  /**
   * Adds a product to the cart.
   *
   * @param {Request} req - The request object.
   * @param {Response} res - The response object.
   * @returns {Promise<Response>} A promise that resolves to a response object.
   */
  removeToCart = async (req: Request, res: Response): Promise<Response> => {
    const itemToDelete = req.params.id;

    try {
      const cartExist = await CartModel.findOne({ cart_user: req.user.id });

      if (!cartExist) {
        logger.warn(PaymentMessage.CartNotFound);
        return sendErrorResponse(res, 404, PaymentMessage.CartNotFound);
      }

      const productExist = await ProductModel.findById(itemToDelete);

      if (!productExist) {
        logger.warn(ProductMessage.NotFound);
        return sendErrorResponse(res, 404, ProductMessage.NotFound);
      }

      const productIndex = cartExist.products.findIndex(
        (product) => product.product_id.toString() === itemToDelete
      );

      if (productIndex > -1) {
        const product = cartExist.products[productIndex];
        cartExist.total_price -= product.price;
        cartExist.products.splice(productIndex, 1);

        if (cartExist.products.length === 0) {
          cartExist.total_price = 0;
        }

        await cartExist.save();
        logger.info(CartMessages.ProductRemoved);
        return successResponse(res, 200, CartMessages.ProductRemoved);
      } else {
        logger.warn(CartMessages.ProductNotInCart);
        return sendErrorResponse(res, 404, CartMessages.ProductNotInCart);
      }
    } catch (error) {
      return handleError(res, "cart", "User", CartMessages.RemoveFromCartError);
    }
  };
}
