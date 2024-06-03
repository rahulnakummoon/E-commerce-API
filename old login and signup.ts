async registerUser(req: Request, res: Response): Promise<Response> {
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

    const verificationToken = randomBytes(32).toString("hex");

    const result = await UserModel.create({
      username: username,
      email: email,
      password: hashedPassword,
      signuptoken: verificationToken,
    });

    await result.save();

    const verificationLink = `${process.env.BASE_URL}user/verifyEmail/${verificationToken}`;

    sendEmail(result.email, UserMessage.VerifyEmail, verificationLink);

    logger.info(UserMessage.RegisterSuccess);
    successResponse(res, 200, UserMessage.RegisterSuccess, result);
  } catch (error) {
    return handleError(res, "Create", "User", error);
  }
}


















async loginUser(req: Request, res: Response): Promise<Response> {
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
      sendErrorResponse(res, 400, UserMessage.VerifyEmailFailed);
      return;
    }

    if (isMatch) {
      const token = generateToken(isUserExist);
      logger.info(UserMessage.LoginSuccess);
      successResponse(res, 200, UserMessage.LoginSuccess, token);
    } else {
      logger.warn(UserMessage.InvalidCredentials);
      sendErrorResponse(res, 404, UserMessage.InvalidCredentials);
    }
  } catch (error) {
    return handleError(res, "login", "User", error);
  }
}