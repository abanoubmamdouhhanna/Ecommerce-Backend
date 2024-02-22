import { Router } from "express";
import { isValid } from "../../middlewares/validation.middleware.js";
import { fileUpload } from "../../utils/multerCloudinary.js";
import * as couponController from "./controller/coupon.controller.js";
import subcategoryRouter from "../subcategory/subcategory.router.js";
import { auth, roles } from "../../middlewares/auth.middleware.js";
import { endPoint } from "./controller/coupon.endPoint.js";
import {
  createCouponSchema,
  headersSchema,
  updateCouponSchema,
} from "./controller/coupon.validation.js";

const router = Router();

//create coupon
router.post(
  "/createCoupon",
  isValid(headersSchema, true),
  auth(endPoint.create),
  fileUpload(2).single("couponImage"),
  isValid(createCouponSchema),
  couponController.createCoupon
);

//get coupons
router.get("/getCoupons", couponController.getCoupons);

//update coupon
router.put(
  "/updateCoupon/:couponId",
  isValid(headersSchema, true),
  auth(endPoint.update),
  fileUpload(2).single("couponImage"),
  isValid(updateCouponSchema),
  couponController.updateCoupon
);

export default router;
