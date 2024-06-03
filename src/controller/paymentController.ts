// Defaults
import { Request, Response } from "express";
import PDFDocument from "pdfkit";
import Stripe from "stripe";
import fs from "fs";
import path from "path";

// Models
import CartModel from "../models/cartModel";
import ProductModel from "../models/productModel";
import UserModel from "../models/userModel";

// Responses Types
import { sendErrorResponse, successResponse } from "../utills/responseHandler";

// Logger
import logger from "../utills/logger";

// Mail service
import { sendEmail } from "../helper/mailServices";

//Constants
import { PaymentMessage, ProductMessage } from "../utills/constants";

//ErrorHandler
import { handleError } from "../utills/errorHandler";

/**
 * PaymentController handles payment-related operations.
 */
export class PaymentController {
  /**
   * Creates a payment link for the user's cart items.
   *
   * @param {Request} req - The request object.
   * @param {Response} res - The response object.
   * @returns {Promise<Response>} - The response with the payment link or error message.
   */
  createPaymentLink = async (req: Request, res: Response): Promise<Response> => {
    try {
      
      /*
       * Defining the Stripe Api instance.
       */
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: "2024-04-10",
      });
      const cart = await CartModel.findOne({ cart_user: req.user.id });

      if (!cart || cart.products.length === 0) {
        logger.warn(PaymentMessage.CartNotFound);
        return sendErrorResponse(res, 404, PaymentMessage.CartNotFound);
      }

      const productIds = cart.products.map((product) => product.product_id);

      const productDetails = await ProductModel.find({
        _id: { $in: productIds },
      });

      const productMap = new Map(
        productDetails.map((product) => [product._id.toString(), product])
      );

      let total = 0;
      
      const lineItems = cart.products.map((product) => {
        const productDetail = productMap.get(product.product_id.toString());

        if (!productDetail) {
          logger.warn(`${ProductMessage.NotFound} - ${product.product_id}`);
          sendErrorResponse(
            res,
            404,
            `${ProductMessage.NotFound} - ${product.product_id}`
          );
          return;
        }

        const unitAmount = productDetail.product_price * 100;
        total += unitAmount * product.quantity;

        return {
          price_data: {
            currency: "usd",
            product_data: {
              name: productDetail.product_name,
            },
            unit_amount: unitAmount,
          },
          quantity: product.quantity,
        };
      });

      const user = await UserModel.findById(req.user.id);

      const customer = await stripe.customers.create({
        name: user?.username,
      });
      const invoice = await stripe.invoices.create({
        customer: customer.id,
      });

      const session = await stripe.checkout.sessions.create({
        customer: customer.id,
        line_items: lineItems,
        mode: "payment",
        success_url: `${process.env.BASE_URL}order/order-placed-successfully`,
        cancel_url: `${process.env.BASE_URL}order/error-in-payment`,
        shipping_address_collection: {
          allowed_countries: ["US", "CA", "GB", "AU", "NZ", "SG", "JP"],
        },
      });

      return res.status(200).json({
        message: "Click on URL to pay!",
        PaymentUrl: session.url,
        SessionId: session.id,
        InvoiceId: invoice.id,
      });
    } catch (error) {
      return handleError(res, "createPaymentLink", "User", error);
    }
  }

  /**
   * Sending Invoice To The E-mail
   *
   * @param {Request} req - The request object.
   * @param {Response} res - The response object.
   * @returns {Promise<Response>} - The response based on success or failure.
   */
  orderSuccess = async (req: Request, res: Response): Promise<Response> => {
    try {
      const user = await UserModel.findById(req.user.id);
      const cart = await CartModel.findOne({ cart_user: req.user.id }).populate(
        "products"
      );
     
      
      if (!user || !cart) {
        logger.warn(PaymentMessage.UserCartNotFound);
        return sendErrorResponse(res, 404, PaymentMessage.UserCartNotFound);
      }

      const invoiceDir = path.join(__dirname, "../invoices");
      if (!fs.existsSync(invoiceDir)) {
        fs.mkdirSync(invoiceDir);
      }

      const pdfPath = path.join(invoiceDir, `invoice_${req.user.id}.pdf`);

      const doc = new PDFDocument({ margin: 50 });
      const writeStream = fs.createWriteStream(pdfPath);

      writeStream.on("finish", async () => {
        console.log("PDF stream finished writing");

        try {
          const emailContent = `
            <h1>Order Placed Successfully</h1>
            <p>Dear ${user.username},</p>
            <p>Thank you for your order. Please find the attached invoice for your purchase.</p>
          `;
          await sendEmail(
            user.email,
            "Your Order Invoice",
            emailContent,
            pdfPath
          );
          fs.unlinkSync(pdfPath);

          return successResponse(
            res,
            200,
            `${PaymentMessage.OrderSuccess} and invoice sent to your email`
          );
        } catch (emailError) {
          return handleError(
            res,
            "orderSuccess",
            "User",
            PaymentMessage.EmailSendingError
          );
        }
      });

      writeStream.on("error", (streamError) => {
        logger.error(PaymentMessage.PDFStreamError, streamError);
        return sendErrorResponse(res, 500, PaymentMessage.PDFStreamError);
      });

      doc.pipe(writeStream);

      doc.fontSize(20).text("Invoice", { align: "center" });
      doc.moveDown();

      doc.fontSize(12).text(`Customer: ${user.username}`);
      doc.text(`Email: ${user.email}`);
      doc.moveDown();

      doc.fontSize(14).text("Product", 50, doc.y, { continued: true });
      doc.text("Quantity", 300, doc.y, { continued: true });
      doc.text("Price", 400, doc.y);
      doc.moveDown();

      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();

      const productPromises = cart.products.map(async (product) => {
        const productDetails = await ProductModel.findById(product.product_id);
        return {
          name: productDetails.product_name,
          quantity: product.quantity,
          price: product.price,
        };
      });

      const products = await Promise.all(productPromises);

      products.forEach((product) => {
        doc.fontSize(12).text(product.name, 50, doc.y);
        doc.text(product.quantity.toString(), 350, doc.y);
        doc.text(`$${product.price.toFixed(2)}`, 500, doc.y);
        doc.moveDown();
      });

      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();

      doc.fontSize(14).text("Total:", 50, doc.y, { continued: true });
      doc.text(`$${cart.total_price.toFixed(2)}`, 430, doc.y);

      doc.end();

      console.log("PDF generation initiated");

      doc.on("end", () => {
        console.log("PDF document end event triggered");
      });

      doc.on("error", (pdfError) => {
        console.error("Error creating PDF:", pdfError);
        logger.error(PaymentMessage.PDFCreationError, pdfError);
        return sendErrorResponse(res, 500, PaymentMessage.PDFCreationError);
      });
    } catch (error) {
      console.error("Error processing order success:", error);
      return handleError(
        res,
        "orderSuccess",
        "User",
        `while sending an invoice`
      );
    }
  }

  /**
   * Order is successfull.
   *
   * @param {Request} req - The request object.
   * @param {Response} res - The response object.
   * @returns {Promise<Response>} - The response based on success or failure.
   */
  placedOrder = async (req: Request, res: Response): Promise<Response> => {
    try {
      logger.info(PaymentMessage.OrderSuccess);
      return successResponse(res, 200, PaymentMessage.OrderSuccess);
    } catch (error) {
      console.error("Error Placing the order", error);
      return handleError(
        res,
        "orderSuccess",
        "User",
        `${PaymentMessage.InternalServerError} while placing an order.`
      );
    }
  }
}
