import joi from "joi";
import { generalFeilds } from "../../../middlewares/validation.middleware.js";

export const headersSchema = generalFeilds.headers;

export const createReviewSchema = joi
  .object({
    productId:generalFeilds.id,
    comment:joi.string().min(2).max(5000).required(),
    rating:joi.number().min(1).max(5).required()
  })
  .required();

  export const updateReviewSchema = joi
  .object({
    productId:generalFeilds.id,
    reviewId:generalFeilds.id,
    comment:joi.string().min(2).max(5000),
    rating:joi.number().min(1).max(5)
  })
  .required();
