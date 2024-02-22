import { Router } from "express";
import * as reviewController from './controller/reviews.controller.js'
import { auth } from "../../middlewares/auth.middleware.js";
import { endPoint } from "./controller/reviews.endPoint.js";
import { isValid } from "../../middlewares/validation.middleware.js";
import { createReviewSchema, headersSchema, updateReviewSchema } from "./controller/reviews.validation.js";

const router=Router({mergeParams:true})

//create review
router.post("/createReview",isValid(headersSchema,true),auth(endPoint.create),isValid(createReviewSchema),reviewController.createReview)

//update review
router.patch("/updateReview/:reviewId",isValid(headersSchema,true),auth(endPoint.update),isValid(updateReviewSchema),reviewController.updateReview)

export default router