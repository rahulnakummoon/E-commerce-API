// Defaults
import { Router } from "express";

// Payment Controller
import { PaymentController } from "../controller/paymentController";

// Payment Router Instance
const paymentRouter: Router = Router();

// Payment Controller Object
const paymentController = new PaymentController();

/**
 * Routes For Payments.
 * @name GET / - Generate Payment Link.
 * @name GET /order-placed-successfully - SuccessFully Placed Order.
 * @name GET /sent-invoice - Sent-invoice to the Email.
 */
paymentRouter.get("/", paymentController.createPaymentLink);
paymentRouter.get("/order-placed-successfully", paymentController.placedOrder);
paymentRouter.get("/sent-invoice", paymentController.orderSuccess);

export { paymentRouter };
