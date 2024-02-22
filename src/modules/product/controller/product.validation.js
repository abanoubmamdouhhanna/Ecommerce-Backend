import joi from "joi";
import { generalFeilds } from "../../../middlewares/validation.middleware.js";

export const headersSchema = generalFeilds.headers;

export const createProductSchema = joi
  .object({
    name: generalFeilds.ProductName.required(),
    description: generalFeilds.description.required(),
    price: generalFeilds.price.required(),
    discount: generalFeilds.discont,
    stock: joi.number().integer().positive().min(1).required(),
    colors: joi.array(),
    size: joi.array(),
    file: joi
      .object({
        mainImage: joi.array().items(generalFeilds.file).length(1).required(),
        subImages: joi.array().items(generalFeilds.file).max(5),
      })
      .required(),
    categoryId: generalFeilds.id,
    subCategoryId: generalFeilds.id,
    brandId: generalFeilds.id,
  })
  .required();



  export const updateProductSchema = joi
  .object({
    productId:generalFeilds.id,
    name: generalFeilds.ProductName,
    description: generalFeilds.description,
    price: generalFeilds.price,
    discount: generalFeilds.discont,
    stock: joi.number().integer().positive().min(1),
    colors: joi.array(),
    size: joi.array(),
    file: joi
      .object({
        mainImage: joi.array().items(generalFeilds.file).max(1),
        subImages: joi.array().items(generalFeilds.file).max(5),
      }),
    categoryId: generalFeilds.optionalId,
    subCategoryId: generalFeilds.optionalId,
    brandId: generalFeilds.optionalId,
  })
  .required();
  
  export const wishlistSchema = joi
  .object({
    productId:generalFeilds.id
  })
  .required();
