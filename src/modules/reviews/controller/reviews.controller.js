import orderModel from "../../../../DB/models/Order.model.js";
import productModel from "../../../../DB/models/Product.model.js";
import reviewModel from "../../../../DB/models/Review.model.js.js";
import { asyncHandler } from "../../../utils/errorHandling.js";


//create review
export const createReview = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const { comment, rating } = req.body;

  const order = await orderModel.findOne({
    userId: req.user._id,
    status: "Delivered",
    "products.productId": productId,
  });
  if (!order) {
    return next(
      new Error("Can't review product before receive it", { cause: 400 })
    );
  }

  //check if you reviewed same product before
  if (
    await reviewModel.findOne({
      productId,
      orderId: order._id,
      createdBy: req.user._id,
    })
  ) {
    return next(new Error("Already reviewed by you", { cause: 400 }));
  }
  const review = await reviewModel.create({
    productId,
    orderId: order._id,
    createdBy: req.user._id,
    rating,
    comment
  });
  return res.status(200).json({
    status: "success",
    message: "You reviewed product successfully",
    result: review,
  });
});
//====================================================================================================================//
//update review

export const updateReview = asyncHandler(async (req, res, next) => {
    const { productId ,reviewId } = req.params;
    if (
      !await reviewModel.findOneAndUpdate({
        _id:reviewId,
        productId,
        createdBy: req.user._id,
      },req.body)
    ) {
      return next(new Error("In-valid review Id", { cause: 400 }));
    }
    return res.status(200).json({
      status: "success",
      message: "Updated your review on product successfully",
    });
  });