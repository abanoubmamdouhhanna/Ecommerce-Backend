import Router from "express"
import { auth } from "../../middlewares/auth.middleware.js"
import { isValid } from "../../middlewares/validation.middleware.js"
import { userFileUpload } from "../../utils/user.multerCloudinary.js"
import * as userController from './controller/user.controller.js'
import { endPoint } from "./controller/user.endPoint.js"
import { changePasswordSchema, headersSchema, updateUserSchema } from "./controller/user.validation.js"

const router =Router()

//user profile
router.get("/userProfile",isValid(headersSchema,true),auth(endPoint.get),userController.userProfile)

//update user
router.post("/updateUser",isValid(headersSchema,true),auth(endPoint.update),isValid(updateUserSchema),userController.updateUser)

//update password
router.patch("/changePassword",isValid(headersSchema,true),auth(endPoint.update),isValid(changePasswordSchema),userController.changePassword)

//delete user
router.delete("/deleteUser",isValid(headersSchema,true),auth(endPoint.delete),userController.deleteUser)

//recover account
router.get("/accountRecovery/:reactiveToken",userController.accountRecovery)

//profile pic
router.patch("/uploadProfilePic",isValid(headersSchema,true),auth(endPoint.update),userFileUpload().single("profile"),userController.uploadProfilePic)

//cover pic
router.patch("/uploadCoverPic",isValid(headersSchema,true),auth(endPoint.update),userFileUpload().single("cover"),userController.uploadCoverPic)
export default router