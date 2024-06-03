// Joi validations
import Joi from "joi";

/**
 * Validate Product details..
 */
const productSchema = Joi.object({
  product_name: Joi.string().min(3).max(30).messages({
    "string.base": "product_name should be a type of 'text'",
    "string.empty": "product_name cannot be an empty field",
    "any.required": "product_name is a required field",
  }),

  product_price: Joi.string().empty().regex(/^\S*$/).messages({
    "string.email": "Enter a valid Email Address",
    "string.pattern.base":
      "Spaces are not allowed in product_price. Please remove them.",
    "string.empty": "product_price is not allowed to be empty",
    "any.required": "product_price is required",
  }),

});

export { productSchema };
