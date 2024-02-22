import joi from "joi";
import { generalFeilds } from "../../../middlewares/validation.middleware.js";

export const headersSchema= generalFeilds.headers

export const createCategorySchema=joi.object(
    {
        name:generalFeilds.name.required(),
        file:generalFeilds.file.required()
    }
).required()

export const updateCategorySchema=joi.object(
    {
        categoryId:generalFeilds.id,
        name:generalFeilds.name,
        file:generalFeilds.file
    }
).required()
