// Defaults
import { Router } from "express";

// User Controller
import { UserController } from "../controller/userController";

// userSchema 
import { userSchema } from "../schema/userSchema";

// user Validator
import { validate } from "../middleware/vaidate";

// MailServices
import { forgotPassget, verifyEmailget } from "../helper/mailServices";

const userRouter: Router = Router();
const userController = new UserController();

/**
 * Routes For User.
 * @name POST /signup - Create A new user.
 * @name POST /login - Login A new user.
 * @name GET /verifyEmail/:token - VerifyEmail Token
 * @name POST /reset/reset-password/ - Send Forgot Password Link.
 * @name POST /reset/reset-password/:token - Reset Password Token.
 */
userRouter.post("/signup", validate(userSchema), userController.registerUser);
userRouter.post("/login", validate(userSchema), userController.loginUser);
userRouter.get("/verifyEmail/:token", verifyEmailget);
userRouter.post("/reset/reset-password/", userController.forgotpass_post);
userRouter.post("/reset/reset-password/:token", forgotPassget);

export { userRouter };
