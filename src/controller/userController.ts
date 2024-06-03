// Defaults
import { Request, Response } from "express";
import { randomBytes } from "crypto";
import bcrypt from "bcrypt";

// JWT
import { generateToken } from "../helper/jwt";

// UserAttributes
import UserAttributes from "../types/userType";

// Logger
import logger from "../utills/logger";

// Responses Types
import { sendErrorResponse, successResponse } from "../utills/responseHandler";

// Models
import UserModel from "../models/userModel";

// MailService
import { sendEmail } from "../helper/mailServices";

// Helper Functions
import { findUser, validateUser } from "../utills/userValidator";

// Constants
import { UserMessage } from "../utills/constants";

// Error Handler
import { handleError } from "../utills/errorHandler";

export class UserController {

  /* Generating a signup Verification Token */

  generateToken = (): { token: string; expires: Date } => {
    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000);
    return { token, expires };
  };

  /**
   * Register A New User
   *
   * @param {Object} req -  The Request Object
   * @param {Object} res - A JSON response indicating success or failure based on validation.
   * @param {string} req.body.username - The username of the user.
   * @param {string} req.body.email - The email of the user.
   * @param {string} req.body.password - The password of the user.
   * @return {*}  {Promise<Response>}
   * @memberof UserController
   */

  registerUser = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { username, email, password }: UserAttributes = req.body;

      if (!validateUser(username, email, password)) {
        return sendErrorResponse(res, 400, UserMessage.Validation);
      }

      const isExists = await findUser(username, email);

      if (isExists) {
        logger.warn(UserMessage.Exists);
        return sendErrorResponse(res, 404, UserMessage.Exists);
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      
      const { token: signuptoken, expires: tokenExpiry } =
        this.generateToken();

      const result = await UserModel.create({
        username: username,
        email: email,
        password: hashedPassword,
        signuptoken: signuptoken,
        signuptokenexpires: tokenExpiry,
      });

      await result.save();

      const verificationLink = `${process.env.BASE_URL}user/verifyEmail/${signuptoken}`;

      sendEmail(result.email, UserMessage.VerifyEmail, verificationLink);

      logger.info(UserMessage.RegisterSuccess);
      successResponse(res, 200, UserMessage.RegisterSuccess, result);
    } catch (error) {
      return handleError(res, "Create", "User", error);
    }
  };



  /**
   * Login A New User.  
   *
   * @param {Object} req -  The Request Object
   * @param {Object} res - A JSON response indicating success or failure based on validation.
   * @param {string} req.body.username - The username of the user.
   * @param {string} req.body.email - The email of the user.
   * @param {string} req.body.password - The password of the user.
   * @return {*}  {Promise<Response>}
   * @memberof UserController
   */

  loginUser = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { username, email, password }: UserAttributes = req.body;

      if (!validateUser(username, email, password)) {
        sendErrorResponse(res, 400, UserMessage.Validation);
        return;
      }

      const isUserExist = await UserModel.findOne({
        email: email,
        username: username,
      });

      if (!isUserExist) {
        logger.warn(UserMessage.InvalidCredentials);
        sendErrorResponse(res, 404, UserMessage.InvalidCredentials);
        return;
      }

      const isMatch = await bcrypt.compare(password, isUserExist.password);

      if (!isUserExist.isVerified) {
        return sendErrorResponse(res, 400, UserMessage.VerifyEmailFailed);
      }

      if (isMatch) {
        const token = generateToken(isUserExist);
        logger.info(UserMessage.LoginSuccess);
        return successResponse(res, 200, UserMessage.LoginSuccess, token);
      } else {
        logger.warn(UserMessage.InvalidCredentials);
        return sendErrorResponse(res, 404, UserMessage.InvalidCredentials);
      }
    } catch (error) {
      return handleError(res, "login", "User", error);
    }
  };

  /**
   * Sends The Password Reset link.
   *
   * @param {Request} req -  The Request Object
   * @param {string} req.body.email - The email of the user to reset the password.
   * @param {Response} res - A JSON response indicating success or failure based on validation.
   * @return {*}  {Promise<Response>}
   * @memberof UserController
   */

  forgotpass_post = async (req: Request, res: Response): Promise<Response> => {
    const { email } = req.body;

    try {
      const user = await UserModel.findOne({ email });

      if (!user) {
        logger.info(UserMessage.NotFound);
        return sendErrorResponse(res, 400, UserMessage.NotFound);
      }

      const { token: forgotpasstoken, expires: tokenExpiry } =
        this.generateToken();

      user.forgotpasstoken = forgotpasstoken;
      user.forgotpasstokenexpires = tokenExpiry;

      await user.save();

      const resetLink = `${process.env.BASE_URL}user/reset/reset-password/${forgotpasstoken}`;

      sendEmail(email, UserMessage.ResetPassword, resetLink);
      logger.info(UserMessage.EmailInstructions);

      return successResponse(res, 200, UserMessage.EmailInstructions, email);
    } catch (error) {
      return handleError(res, "forgotpass", "User", error);
    }
  };
}
