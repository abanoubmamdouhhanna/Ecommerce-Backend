import joi from "joi";
import { generalFeilds } from "../../../middlewares/validation.middleware.js";

export const headersSchema= generalFeilds.headers

export const createBrandSchema=joi.object(
    {
        name:generalFeilds.brandName.required(),
        file:generalFeilds.file
    }
).required()

export const updateBrandSchema=joi.object(
    {
        brandId:generalFeilds.id,
        name:generalFeilds.brandName,
        file:generalFeilds.file
    }
).required()
