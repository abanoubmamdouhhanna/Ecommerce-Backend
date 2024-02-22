import { Router } from "express";
import { auth } from "../../middlewares/auth.middleware.js";
import { isValid } from "../../middlewares/validation.middleware.js";
import { fileUpload } from "../../utils/multerCloudinary.js";
import * as subcategoryController from "./controller/subcategory.controller.js";
import { endPoint } from "./controller/subcategory.endPoint.js";
import {
  createSubcategorySchema,
  headersSchema,
  updateSubcategorySchema,
} from "./controller/subcategory.validation.js";

const router = Router({ mergeParams: true });

//create subcategory
router.post(
  "/createSubcategory",
  isValid(headersSchema, true),
  auth(endPoint.create),
  fileUpload(2).single("subcategoryImage"),
  isValid(createSubcategorySchema),
  subcategoryController.createSubcategory
);

//get categories
router.get("/getSubCategories", subcategoryController.getSubCategories);

//update subcategory
router.put(
  "/updateSubcategory/:subcategoryId",
  isValid(headersSchema, true),
  auth(endPoint.update),
  fileUpload(2).single("subcategoryImage"),
  isValid(updateSubcategorySchema),
  subcategoryController.updateSubcategory
);

export default router;
