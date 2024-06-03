// Mongooese Document
import { Document } from "mongoose";

/**
 * Interface representing attributes of a user.
 * @interface ProductAttributes
 * @property {string} product_name - The username of the user.
 * @property {number} product_price - The unique identifier of the user.
 */
interface ProductAttributes extends Document {
  product_name: string;
  product_price: number;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

export default ProductAttributes;
