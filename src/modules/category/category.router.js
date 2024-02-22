import { Router } from "express";
import { isValid } from "../../middlewares/validation.middleware.js";
import { fileUpload } from "../../utils/multerCloudinary.js";
import * as categoryController from "./controller/category.controller.js";
import subcategoryRouter from "../subcategory/subcategory.router.js";
import {
  createCategorySchema,
  headersSchema,
  updateCategorySchema,
} from "./controller/category.validation.js";
import { auth, roles } from "../../middlewares/auth.middleware.js";
import { endPoint } from "./controller/category.endPoint.js";

const router = Router();
router.use("/:categoryId/subcategory", subcategoryRouter);

//create category
router.post(
  "/createCategory",
  isValid(headersSchema, true),
  auth(endPoint.create),
  fileUpload(2).single("categoryImage"),
  isValid(createCategorySchema),
  categoryController.createCategory
);

//get categories
router.get(
  "/getCategories",
  categoryController.getCategories
);

//update category
router.put(
  "/updateCategory/:categoryId",
  isValid(headersSchema, true),
  auth(endPoint.update),
  fileUpload(2).single("categoryImage"),
  isValid(updateCategorySchema),
  categoryController.updateCategory
);

export default router;
