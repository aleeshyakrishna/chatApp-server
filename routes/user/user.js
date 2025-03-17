import express from 'express';
var router = express.Router();

import { validate,catchErrors } from '../../errorHandler/index.js';
import {login,register} from "../../controllers/user/account/index.js";
import { loginValidation, signupValidation } from '../../validation/user/userValidation.js';

router.post("/user-register",
  validate(signupValidation),
  catchErrors(register));

router.post(
  "/user-login",
  validate(loginValidation),
  catchErrors(login)
);

export default router;
