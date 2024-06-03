/** Constant Of the User */

export const UserMessage = {
  Validation: "Please provide username, email, and password.",
  Exists: "Email or Username Is Already Exists.",
  RegisterSuccess: "User Registered Successfully.",
  NotFound: "User Not Found.",
  InvalidCredentials: "Invalid email or password.",
  LoginSuccess: "User Login Successfully.",
  VerifyEmail: "Verify Your Email",
  VerifyEmailFailed: "User Email is not verified",
  ResetPassword: "Reset Your Password",
  EmailInstructions:
    "An email has been sent to your address with further instructions.",
};

/** Constant Of the Product */

export const ProductMessage = {
  Validation: "Please provide Product Name and Product Price.",
  InvalidIdFormat: "Invalid product ID format.",
  NotFound: "Product Not Found.",
  CreateSuccess: "Product Created Successfully.",
  UpdateSuccess: "Product Updated Successfully.",
  DeleteSuccess: "Product Deleted Successfully.",
};

/** Constant Of the Payment */

export const PaymentMessage = {
  OrderSuccess: "Order Placed SuccessFully",
  CartNotFound: "Cart not found",
  UserCartNotFound: "User or Cart not found",
  InternalServerError: "Internal Server Error",
  EmailSendingError: "Error sending email",
  PDFStreamError: "Error writing PDF stream",
  PDFCreationError: "Error creating PDF",
};

/** Constant Of the Cart */

export const CartMessages = {
  GetItemsError: "Internal Server Error Getting All Products.",
  AddToCartError: "Internal Server Error Adding Product to Cart.",
  RemoveFromCartError: "Internal Server Error Removing Product from Cart.",
  ProductIdAndQuantityRequired: "product_id and quantity is required.",
  ProductNotInCart: "Product Does not Exist in the cart.",
  ProductRemoved: "Product removed from cart successfully.",
  ProductAdded: "Product added to cart successfully.",
};
