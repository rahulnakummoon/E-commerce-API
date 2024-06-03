// Default Imports
import { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import { sendErrorResponse, successResponse } from "../utills/responseHandler";

// Loggers
import logger from "../utills/logger";

// Models
import ProductModel from "../models/productModel";

// ErrorHandler
import { handleError } from "../utills/errorHandler";

//Constants
import { ProductMessage } from "../utills/constants";

export class ProductController {
  /**
   * Retrieves Products from the database.
   *
   * @param {Request} req - The request object.
   * @param {Response} res - The response object.
   * @returns {Promise<Response>} A promise that resolves to a response object.
   */
  getProducts = async (req: Request, res: Response): Promise<Response> => {
    try {
      const result = await ProductModel.find({});
      successResponse(res, 200, "data", result);
      return;
    } catch (error) {
      return handleError(res, "Get", "Product", error);
    }
  };

  /**
   * creates a new product.
   *
   * @param {Request} req - The request object.
   * @param {Response} res - The response object.
   * @returns {Promise<Response>} A promise that resolves to a response object.
   */
  createProduct = async (req: Request, res: Response): Promise<Response> => {
    const { product_name, product_price } = req.body;

    if (!product_name || !product_price) {
      logger.error(ProductMessage.Validation);
      sendErrorResponse(res, 400, ProductMessage.Validation);
      return;
    }

    try {
      const newProduct = await ProductModel.create({
        product_name: product_name,
        product_price: product_price,
      });

      await newProduct.save();

      logger.info(`${ProductMessage.CreateSuccess} ${newProduct}`);
      successResponse(res, 200, ProductMessage.CreateSuccess, newProduct);
    } catch (error) {
      return handleError(res, "Create", "Product", error);
    }
  };

  /**
   *  updates a product.
   *
   * @param {Request} req - The request object.
   * @param {Response} res - The response object.
   * @returns {Promise<Response>} A promise that resolves to a response object.
   */
  updateProduct = async (req: Request, res: Response) => {
    const productToUpdateId = req.params.id;
    const { product_name, product_price } = req.body;

    try {
      if (!product_name && !product_price) {
        logger.error(ProductMessage.Validation);
        sendErrorResponse(res, 400, ProductMessage.Validation);
        return;
      }

      if (!isValidObjectId(productToUpdateId)) {
        logger.error(ProductMessage.InvalidIdFormat);
        return sendErrorResponse(res, 400, ProductMessage.InvalidIdFormat);
      }

      const updatedProduct = await ProductModel.findByIdAndUpdate(
        { _id: productToUpdateId },
        { product_name, product_price },
        { new: true }
      );

      if (!updatedProduct) {
        logger.error(ProductMessage.NotFound);
        sendErrorResponse(res, 404, ProductMessage.NotFound);
        return;
      }

      logger.info(ProductMessage.UpdateSuccess);
      return successResponse(res, 200, "product", updatedProduct);
    } catch (error) {
      return handleError(res, "Update", "Product", error);
    }
  };

  /**
   *  Deletes a product.
   *
   * @param {Request} req - The request object.
   * @param {Response} res - The response object.
   * @returns {Promise<Response>} A promise that resolves to a response object.
   */
  deleteProduct = async (req: Request, res: Response) => {
    try {
      const productToDelete = req.params.id;

      if (!isValidObjectId(productToDelete)) {
        logger.error(ProductMessage.InvalidIdFormat);
        sendErrorResponse(res, 400, ProductMessage.InvalidIdFormat);
        return;
      }

      const deletedProduct = await ProductModel.findByIdAndDelete({
        _id: productToDelete,
      });

      if (!deletedProduct) {
        sendErrorResponse(res, 404, ProductMessage.NotFound);
        return;
      }

      logger.info(ProductMessage.DeleteSuccess);
      successResponse(res, 200, "Deleted", deletedProduct);
    } catch (error) {
      return handleError(res, "Delete", "Product", error);
    }
  };
}
