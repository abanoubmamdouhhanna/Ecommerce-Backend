import moment from "moment/moment.js";
import UserModel from "../../../../DB/models/User.model.js";
import cloudinary from "../../../utils/cloudinary.js";
import sendEmail from "../../../utils/Emails/sendEmail.js";
import { accountRecoveryEmail } from "../../../utils/Emails/accountRecoveryEmail.js";
import { asyncHandler } from "../../../utils/errorHandling.js";
import { compare, Hash } from "../../../utils/Hash&Compare.js";
import {
  generateToken,
  verifyToken,
} from "../../../utils/generateAndVerifyToken.js";
//user profile
export const userProfile = asyncHandler(async (req, res, next) => {
  const user = await UserModel.findOne({ _id: req.user._id }).select(
    "userName firstName lastName email age phone gender"
  );
  return res.status(200).json({status:"Success" ,message: "Done", user });
});

//====================================================================================================================//
//update user
export const updateUser = asyncHandler(async (req, res, next) => {
  const { userName, phone, address, gender, age, DOB } = req.body;
  if (!(userName || phone || address || gender || age || DOB)) {
    return next(new Error("We need information to update", { cause: 400 }));
  }

  const checkUser = await UserModel.findById({ _id: req.user._id });

  const object = { ...req.body };

  for (let key in object) {
    if (checkUser[key] == object[key]) {
      return next(
        new Error(
          `I'm sorry, but we cannot update your ${key} with your old one. Please make sure that ${key} you have entered correctly and try again.`,
          { cause: 400 }
        )
      );
    }
  }

  if (userName) {
    if (await UserModel.findOne({ userName })) {
      return next(
        new Error(
          "I'm sorry, but the username you have chosen is already taken",
          { cause: 400 }
        )
      );
    }
  }
  if (checkUser.isDeleted == true) {
    return next(
      new Error(
        "Can't update your information because your account may be suspended or deleted",
        { cause: 400 }
      )
    );
  }
  const user = await UserModel.findByIdAndUpdate(
    { _id: req.user._id },

    req.body,
    { new: true }
  );
  return res
    .status(200)
    .json({ status: "success", message: "User updated", result: user });
});

//====================================================================================================================//
//update password
export const changePassword = asyncHandler(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  const matchOld = compare({
    plainText: oldPassword,
    hashValue: req.user.password,
  });
  if (!matchOld) {
    return next(new Error("In-valid password", { cause: 409 }));
  }
  const checkMatchNew = compare({
    plainText: newPassword,
    hashValue: req.user.password,
  });
  if (checkMatchNew) {
    return next(
      new Error("New password can't be old password", { cause: 400 })
    );
  }
  const hashPassword = Hash({ plainText: newPassword });
  const user = await UserModel.findByIdAndUpdate(
    req.user._id,
    { password: hashPassword },
    { new: true }
  ).select("userName email updatedAt");
  return res.status(200).json({
    status: "success",
    message: "Password updated successfully",
    result: user,
  });
});

//====================================================================================================================//
//deleteUser
export const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await UserModel.findByIdAndUpdate(
    req.user._id,
    { isDeleted: true, status: "not Active" },
    { new: true }
  ).select("userName email isDeleted permanentlyDeleted");
  user.permanentlyDeleted = moment().add(1, "month").calendar();
  await user.save();
  const reactiveToken = generateToken({
    payload: { email: user.email },
    signature: process.env.RECOVER_ACCOUNT_SIGNATURE,
    expiresIn: 60 * 60 * 24 * 30,
  });

  const link = `${req.protocol}://${req.headers.host}/user/accountRecovery/${reactiveToken}`;
  const html = accountRecoveryEmail(link);
  if (
    !(await sendEmail({ to: user.email, subject: "reactivate account", html }))
  ) {
    return next(new Error("Something went wrong", { cause: 400 }));
  }
  return res.status(200).json({
    status: "success",
    message:
      "The account has been successfully disabled, you have 30 days to recover it or it will be permanently deleted.",
  });
});

//====================================================================================================================//
//recover account
export const accountRecovery = asyncHandler(async (req, res, next) => {
  const { reactiveToken } = req.params;
  const decoded = verifyToken({
    payload: reactiveToken,
    signature: process.env.RECOVER_ACCOUNT_SIGNATURE,
  });
  const user = await UserModel.updateOne(
    { email: decoded.email, isDeleted: true },
    { isDeleted: false, $unset: { permanentlyDeleted: 1 }, status: "Active" }
  );
  if (user.matchedCount == 0) {
    return next(new Error("Account may be already active", { cause: 410 }));
  }

  return res.status(200).json({
    status: "success",
    message: "Your account recoverd successfully",
    result: user,
  });
});

//====================================================================================================================//
//profile pic
export const uploadProfilePic = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(
      new Error("Please select your profile picture", { cause: 400 })
    );
  }
  if (req.file.size > 1 * 1000 * 1000) {
    return next(
      new Error(
        `Maximum Profile picture size to upload is 1 MB , and yours is ${(
          req.file.size / 1000000
        ).toFixed(2)} MB`,
        { cause: 413 }
      )
    );
  }
  const user = await UserModel.findById(req.user._id);

  const profilePic = await cloudinary.uploader.upload(req.file.path, {
    folder: `${process.env.APP_NAME}/users/${user._id}/profile`,
    public_id: `${user._id}profilePic`,
  });
  user.profileURL = profilePic.secure_url;
  await user.save();

  return res.status(200).json({
    status: "success",
    message: "Profile Picture uploaded successfully",
    user: user,
  });
});

//====================================================================================================================//
//cover pic uploadCoverPic
export const uploadCoverPic = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new Error("Please select your cover picture", { cause: 400 }));
  }
  if (req.file.size > 1 * 1000 * 1000) {
    return next(
      new Error(
        `Maximum Cover picture size to upload is 1 MB , and yours is ${(
          req.file.size / 1000000
        ).toFixed(2)} MB`,
        { cause: 413 }
      )
    );
  }
  const user = await UserModel.findById(req.user._id);

  const coverPic = await cloudinary.uploader.upload(req.file.path, {
    folder: `${process.env.APP_NAME}/users/${user._id}/cover`,
    public_id: `${user._id}coverPic`,
  });
  user.coverURL = coverPic.secure_url;
  await user.save();

  return res.status(200).json({
    status: "success",
    message: "Cover Picture uploaded successfully",
    user: user,
  });
});
