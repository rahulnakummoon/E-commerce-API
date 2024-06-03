// Joi validations

import Joi from "joi";

/**
 * Validate User details..
 */
const userSchema = Joi.object({
  username: Joi.string().min(3).max(30).messages({
    "string.base": "username should be a type of 'text'",
    "string.empty": "username cannot be an empty field",
    "string.min": "username should have a minimum length of 3",
    "string.max": "username should have a maximum length of 30",
    "any.required": "username is a required field",
  }),

  email: Joi.string().empty().email().regex(/^\S*$/).messages({
    "string.email": "Enter a valid Email Address",
    "string.pattern.base":
      "Spaces are not allowed in username. Please remove them.",
    "string.empty": "Email is not allowed to be empty",
    "any.required": "Email is required",
  }),

  password: Joi.string().regex(/^\S*$/).messages({
    "string.empty": "password is not allowed to be empty",
    "string.pattern.base":
      "Spaces are not allowed in password. Please remove them.",
    "any.required": "password is required!",
  }),
});

export { userSchema };
