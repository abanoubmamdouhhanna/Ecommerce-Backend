import { Router } from "express";
import * as cartController from "./controller/cart.controller.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { endPoint } from "./controller/Cart.endPoint.js";
import { isValid } from "../../middlewares/validation.middleware.js";
import {
  addToCartSchema,
  headersSchema,
} from "./controller/cart.validation.js";

const router = Router();

//get cart
router.get(
  "/",
  isValid(headersSchema, true),
  auth(endPoint.create),
  cartController.getCart
);

//create cart
router.post(
  "/addToCart",
  isValid(headersSchema, true),
  auth(endPoint.create),
  isValid(addToCartSchema),
  cartController.addToCart
);

//clear cart
router.patch(
  "/clearCart",
  isValid(headersSchema, true),
  auth(endPoint.create),
  cartController.clearCart
);

//clear cart
router.patch(
  "/clearCartItem",
  isValid(headersSchema, true),
  auth(endPoint.create),
  cartController.clearCartItem
);

export default router;
