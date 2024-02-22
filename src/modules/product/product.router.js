import { Router } from "express";
import { auth } from "../../middlewares/auth.middleware.js";
import { endPoint } from "./controller/product.endPoint.js";
import * as productController from "./controller/product.controller.js";
import { fileUpload } from "../../utils/multerCloudinary.js";
import { isValid } from "../../middlewares/validation.middleware.js";
import { createProductSchema, headersSchema, updateProductSchema, wishlistSchema } from "./controller/product.validation.js";
import reviewsRouter from '../reviews/reviews.router.js'

const router = Router();
router.use("/:productId/reviews",reviewsRouter)

//get products
router.get("/",productController.productList)

//create product
router.post(
  "/createProduct",
  isValid(headersSchema,true),
  auth(endPoint.create),
  fileUpload(2).fields([
    {
      name: "mainImage",
      maxCount: 1,
    },
    {
      name: "subImages",
      maxCount: 5,
    },
  ]),
  isValid(createProductSchema),
  productController.createProduct
);

//update product
router.put(
    "/updateProduct/:productId",
    isValid(headersSchema,true),
    auth(endPoint.create),
    fileUpload(2).fields([
      {
        name: "mainImage",
        maxCount: 1,
      },
      {
        name: "subImages",
        maxCount: 5,
      },
    ]),
    isValid(updateProductSchema),
    productController.updateProduct
  );

  
//wishlist
router.patch(
  "/wishlist/:productId",
  isValid(headersSchema,true),
  auth(endPoint.wishlist),
  isValid(wishlistSchema),
  productController.wishlist
);

//remove From wishlist
router.patch(
  "/wishlist/:productId/remove",
  isValid(headersSchema,true),
  auth(endPoint.wishlist),
  isValid(wishlistSchema),
  productController.removeFromWishlist
);

export default router;
