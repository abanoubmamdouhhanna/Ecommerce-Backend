import crypto from "crypto";
import UserModel from "../../../../DB/models/User.model.js";
import moment from "moment/moment.js";
import sendEmail from "../../../utils/Emails/sendEmail.js";
import { activationMail } from "../../../utils/Emails/activationMail.js";
import { passwordEmail } from "../../../utils/Emails/forgetPasswordEmail.js";
import { otpEmail } from "../../../utils/Emails/optEmail.js";
import { compare, Hash } from "../../../utils/Hash&Compare.js";
import { asyncHandler } from "../../../utils/errorHandling.js";
import { otp } from "../../../utils/otpGenerator.js";
import {
  generateToken,
  verifyToken,
} from "../../../utils/generateAndVerifyToken.js";

// registeration
export const signUp = asyncHandler(async (req, res, next) => {
  const { userName,firstName,lastName, email, password, age, gender, phone } = req.body;
  const existedUser = await UserModel.findOne({ email });
  if (existedUser) {
    return next(new Error("Email already exist", { cause: 401 }));
  }
  const activationCode = crypto.randomBytes(64).toString("hex");

  const protocol = req.protocol;
  const host = req.headers.host;

  const html = activationMail(activationCode, protocol, host);
  const info = await sendEmail({
    to: email,
    subject: "Confirmation mail",
    html,
  });
  if (!info) {
    return next(new Error("Rejected Email", { cause: 400 }));
  }
  const hashPassword = Hash({ plainText: password });
  const createUser = await UserModel.create({
    userName,
    firstName,
    lastName,
    email,
    password: hashPassword,
    age,
    gender,
    phone,
    activationCode,
  });
  return res.status(200).json({
    message: "User added successfully",
    user: createUser._id,
  });
});
//====================================================================================================================//

// log in
export const logIn = asyncHandler(async (req, res, next) => {
  const { userName, email, password } = req.body;
  if (!(userName && email && password))
    return next(new Errot("Data is required", { cause: 400 }));
  const user = await UserModel.findOne({ userName, email });
  if (user?.isDeleted || user?.isBlocked) {
    return next(
      new Error(
        "Your account suspended or removed ,contact support for more information",
        { cause: 403 }
      )
    );
  }
  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }
  if (!user.isConfirmed) {
    return next(new Error("Please, confirm your account", { cause: 400 }));
  }

  const match = compare({ plainText: password, hashValue: user.password });

  if (!match) {
    return next(new Error("password in correct", { cause: 401 }));
  }
  const token = generateToken({
    payload: { id: user._id, user_name: user.userName, email: user.email },
  });
  user.status = "Active";
  await user.save();
  return res
    .status(200)
    .json({ message: "Logged in successfully", authorization: { token } });
});

//====================================================================================================================//
//log out
export const logOut = asyncHandler(async (req, res, next) => {
  await UserModel.findByIdAndUpdate(
    req.user._id,
    { status: "not Active" },
    { new: true }
  );
  return res.status(200).json({
    status: "success",
    message: "LoggedOut successfully",
  });
});

//====================================================================================================================//
// Activate account

export const activateAcc = asyncHandler(async (req, res, next) => {
  const user = await UserModel.updateOne(
    { activationCode: req.params.activationCode },
    {
      isConfirmed: true,
      $unset: { activationCode: 1 },
    }
  );

  return user.matchedCount
    ? res.send("congratulations, your account is now activated")
    : next(new Error("Account not found"));
});
//====================================================================================================================//

//forget password
export const forgetPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await UserModel.findOne({ email });
  if (!user) {
    return next(new Error("User not found!", { cause: 404 }));
  }

  const forgetPasswordToken = generateToken({
    payload: { email: user.email, userId: user._id },
    signature: process.env.FORGET_PASSWORD_SIGNATURE,
    expiresIn: 60 * 5,
  });
  const link = `${req.protocol}://${req.headers.host}/auth/resetPassword/${forgetPasswordToken}`;
  const html = passwordEmail(link);

  const info = await sendEmail({
    to: email,
    subject: "Forget Password",
    html,
  });
  if (!info) {
    return next(new Error("Rejected Email", { cause: 400 }));
  }
  return res.status(200).json({
    status: "success",
    message: "Reset email password sent to your account",
  });
});

//====================================================================================================================//
//reset password
export const resetPassword = async (req, res, next) => {
  const { fp_token } = req.params;
  const { password } = req.body;

  const { email } = verifyToken({
    payload: fp_token,
    signature: process.env.FORGET_PASSWORD_SIGNATURE,
  });
  const user = await UserModel.findOne({ email });
  const match = compare({ plainText: password, hashValue: user.password });

  if (match) {
    return next(
      new Error("New password can't be old password", { cause: 400 })
    );
  }
  await UserModel.updateOne(
    { email },
    {
      password: Hash({ plainText: password }),
      changeAccountInfo: Date.now(),
      status: "not Active",
    }
  );

  return res.send("Password updated successfully");
};
//====================================================================================================================//
//forget password By OTP
export const forgetPasswordOTP = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await UserModel.findOne({ email });
  if (!user) {
    return next(new Error("User not found!", { cause: 404 }));
  }
  const OTP = otp();
  await UserModel.findOneAndUpdate(
    { email },
    {
      otp: Hash({ plainText: OTP }),
      otpexp: moment().add(1, "day"),
    }
  );
  const redirectLink = `${req.protocol}://${req.headers.host}/auth/resetPasswordOTP/${email}`;

  const html = otpEmail(OTP, redirectLink);
  const info = await sendEmail({
    to: email,
    subject: "Forget Password otp",
    html,
  });
  if (!info) {
    return next(new Error("Rejected Email", { cause: 400 }));
  }
  return res.status(200).json({
    status: "success",
    message: "OTP code have been sent to your account",
  });
});
//====================================================================================================================//
//reset password by otp

export const resetPasswordOTP = asyncHandler(async (req, res, next) => {
  const { userEmail } = req.params;
  const { otp, password } = req.body;
  const user = await UserModel.findOne({ email: userEmail });
  if (!user) {
    return next(new Error("User not found!", { cause: 404 }));
  }
  if (moment().diff(user.otpexp, "hours") >= 0) {
    return next(new Error(`OTP code has been Expired`, { cause: 410 }));
  }

  const matchOTP = compare({ plainText: otp, hashValue: user.otp });
  if (matchOTP) {
    (user.password = Hash({ plainText: password })), (user.otp = undefined);
    user.otpexp = undefined;
    user.changeAccountInfo = Date.now();
    user.status = "not Active";
    await user.save();

    return res.status(200).json({
      status: "success",
      message: "Password has been changed successfully",
    });
  }
  return next(new Error(`Invalid OTP code`, { cause: 409 }));
});
