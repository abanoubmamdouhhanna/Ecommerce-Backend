import { Router } from "express";
import * as orderController from "./controller/order.controller.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { endPoint } from "./controller/order.endPoint.js";
import { isValid } from "../../middlewares/validation.middleware.js";
import {
  cancelOrderSchema,
  createOrderSchema,
  deliveredOrderSchema,
  headersSchema,
} from "./controller/order.validation.js";

const router = Router();

//create Order
router.post(
  "/createOrder",
  isValid(headersSchema, true),
  auth(endPoint.create),
  isValid(createOrderSchema),
  orderController.createOrder
);

//cancel order
router.patch(
  "/CancelOrder/:orderId",
  isValid(headersSchema, true),
  auth(endPoint.cancel),
  isValid(cancelOrderSchema),
  orderController.CancelOrder
);

//orderd delivered
router.patch(
  "/:orderId/delivered",
  isValid(headersSchema, true),
  auth(endPoint.delivered),
  isValid(deliveredOrderSchema),
  orderController.deliveredOrder
);

export default router;
