// Defaults
import { Request, Response, NextFunction } from "express";

// Joi Validation
import { Schema } from "joi";

// Responses Types
import { sendErrorResponse } from "../utills/responseHandler";

// Validator function to validate the schames.
const validate = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const data = req.body;
    const validationResult = schema.validate(data);
    if (!validationResult.error) {
      return next();
    } else {
      const errorMessage = validationResult.error.details[0].message;
      sendErrorResponse(res, 400, errorMessage);
    }
  };
};

export { validate };
