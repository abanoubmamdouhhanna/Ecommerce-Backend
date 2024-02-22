import joi from "joi"; 
import { generalFeilds } from "../../../middlewares/validation.middleware.js";

export const headersSchema= generalFeilds.headers

export const updateUserSchema=joi.object(
    {
        userName:generalFeilds.userName,
        phone:generalFeilds.phone,
        DOB:joi.string(),  
        age:generalFeilds.age,
        gender:generalFeilds.gender
    }
).required()

export const changePasswordSchema=joi.object(
    {
        oldPassword:generalFeilds.password,
        newPassword:generalFeilds.password
    }
).required()