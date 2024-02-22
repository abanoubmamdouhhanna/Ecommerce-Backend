import { Router } from "express";
import { isValid } from "../../middlewares/validation.middleware.js";
import { fileUpload } from "../../utils/multerCloudinary.js";
import * as brandController from "./controller/brand.controller.js";

import { auth } from "../../middlewares/auth.middleware.js";
import { endPoint } from "./controller/brand.endPoint.js";
import { createBrandSchema, headersSchema, updateBrandSchema } from "./controller/brand.validation.js";

const router = Router();

//create brand
router.post(
  "/createBrand",
  isValid(headersSchema, true),
  auth(endPoint.create),
  fileUpload(2).single("brandImage"),
  isValid(createBrandSchema),
 brandController.createBrand
);

//get brands
router.get(
  "/getBrands",
  brandController.getBrands
);

//update brand
router.put(
  "/updateBrand/:brandId",
  isValid(headersSchema, true),
  auth(endPoint.update),
  fileUpload(2).single("brandImage"),
  isValid(updateBrandSchema),
  brandController.updateBrand
);

export default router;
