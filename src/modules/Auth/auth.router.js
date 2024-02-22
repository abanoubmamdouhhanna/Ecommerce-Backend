import { Router } from "express";
import { auth } from "../../middlewares/auth.middleware.js";
import { isValid } from "../../middlewares/validation.middleware.js";
import * as authController from './controller/auth.controller.js'
import { endPoint } from "./controller/auth.endPoint.js";
import { authRegisterSchema, forgetPasswordSchema, headersSchema, logInSchema, resetPasswordOTPSchema, resetPasswordSchema } from "./controller/auth.validation.js";

const router =Router()

//registeration
router.post("/register",isValid(authRegisterSchema),authController.signUp)

//login
router.post("/login",isValid(logInSchema),authController.logIn)

//log out
router.patch("/logOut",isValid(headersSchema,true),auth(endPoint.logOut),authController.logOut)

//email confirmation
router.get("/confirm/:activationCode",authController.activateAcc)

//forget password
router.post("/forgetPassword",isValid(forgetPasswordSchema),authController.forgetPassword)

//reset password
router.post("/resetPassword/:fp_token",isValid(resetPasswordSchema),authController.resetPassword)

//forget password By OTP
router.post("/forgetPasswordOTP",isValid(forgetPasswordSchema),authController.forgetPasswordOTP)

//reset password by otp
router.post("/resetPasswordOTP/:userEmail",isValid(resetPasswordOTPSchema),authController.resetPasswordOTP)

export default router