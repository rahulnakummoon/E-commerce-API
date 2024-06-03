
// the way it should work normally
==============================================
const registerUser = asyncHandlerPromise(async (req: Request, res: Response): Promise<Response> => {
  const { username, email, password } = req.body;

  if (!validateUser(username, email, password)) {
    return sendErrorResponse(res, 400, UserMessage.Validation);
  }

  const isExists = await findUser(username, email);

  if (isExists) {
    logger.warn(UserMessage.Exists);
    return sendErrorResponse(res, 404, UserMessage.Exists);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const { token: signuptoken, expires: tokenExpiry } = generateToken();

  const result = await UserModel.create({
    username,
    email,
    password: hashedPassword,
    signuptoken,
    signuptokenexpires: tokenExpiry,
  });

  await result.save();

  const verificationLink = `${process.env.BASE_URL}user/verifyEmail/${signuptoken}`;

  sendEmail(result.email, UserMessage.VerifyEmail, verificationLink);

  logger.info(UserMessage.RegisterSuccess);
  return successResponse(res, 200, UserMessage.RegisterSuccess, result);
});

========================================================

import { Request, Response, NextFunction } from 'express';

type RequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<Response> | void;
type ErrorHandler = (res: Response, error: any) => Response;

const asyncHandlerPromise = (requestHandler: RequestHandler, errorHandler?: ErrorHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(requestHandler(req, res, next)).catch((error) => {
      if (errorHandler) {
        return errorHandler(res, error);
      }
      return next(error);
    });
  };
};

export default asyncHandlerPromise;

-----------------------------------------------------------

import { Response } from 'express';

export const handleError = (res: Response, operation: string, entity: string, error: any): Response => {
  console.error(`${operation} ${entity} Error:`, error);
  return res.status(500).json({
    success: false,
    message: `Failed to ${operation.toLowerCase()} ${entity.toLowerCase()}`,
    error: error.message,
  });
};

--------------------------------------------------------------


import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import asyncHandlerPromise from './asyncHandler';
import UserModel from './models/UserModel'; 
import { validateUser, findUser, sendErrorResponse, successResponse, sendEmail, UserMessage } from './utils'; 
import { handleError } from './errorHandler';

const registerUser = asyncHandlerPromise(async (req: Request, res: Response): Promise<Response> => {
  const { username, email, password } = req.body;

  if (!validateUser(username, email, password)) {
    return sendErrorResponse(res, 400, UserMessage.Validation);
  }

  const isExists = await findUser(username, email);

  if (isExists) {
    logger.warn(UserMessage.Exists);
    return sendErrorResponse(res, 404, UserMessage.Exists);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const { token: signuptoken, expires: tokenExpiry } = generateToken();

  const result = await UserModel.create({
    username,
    email,
    password: hashedPassword,
    signuptoken,
    signuptokenexpires: tokenExpiry,
  });

  await result.save();

  const verificationLink = `${process.env.BASE_URL}user/verifyEmail/${signuptoken}`;

  sendEmail(result.email, UserMessage.VerifyEmail, verificationLink);

  logger.info(UserMessage.RegisterSuccess);
  return successResponse(res, 200, UserMessage.RegisterSuccess, result);
}, (res: Response, error: any) => handleError(res, "Create", "User", error));

export default {
  registerUser,
};

]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]

// Normally handler errors using global middleware

import { Request, Response, NextFunction } from 'express';

const asyncHandlerPromise = (requestHandler: (req: Request, res: Response, next: NextFunction) => Promise<Response> | void) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(requestHandler(req, res, next)).catch(next);
  };
};

export default asyncHandlerPromise;
==================================================


const registerUser = asyncHandlerPromise(async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
  const { username, email, password } = req.body;

  if (!validateUser(username, email, password)) {
    return sendErrorResponse(res, 400, UserMessage.Validation);
  }

  const isExists = await findUser(username, email);

  if (isExists) {
    logger.warn(UserMessage.Exists);
    return sendErrorResponse(res, 404, UserMessage.Exists);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const { token: signuptoken, expires: tokenExpiry } = generateToken();

  const result = await UserModel.create({
    username,
    email,
    password: hashedPassword,
    signuptoken,
    signuptokenexpires: tokenExpiry,
  });

  await result.save();

  const verificationLink = `${process.env.BASE_URL}user/verifyEmail/${signuptoken}`;

  sendEmail(result.email, UserMessage.VerifyEmail, verificationLink);

  logger.info(UserMessage.RegisterSuccess);
  return successResponse(res, 200, UserMessage.RegisterSuccess, result);
});

export default {
  registerUser,
};

===================================================

// global  handler error

import { Request, Response, NextFunction } from 'express';

const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
};

export default globalErrorHandler;

// in app.ts
=====================
app.use(globalErrorHandler);
