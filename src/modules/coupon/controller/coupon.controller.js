import couponModel from "../../../../DB/models/Coupon.model.js";
import cloudinary from "../../../utils/cloudinary.js";
import { asyncHandler } from "../../../utils/errorHandling.js";
import { nanoid } from "nanoid";

//create coupon
export const createCoupon = asyncHandler(async (req, res, next) => {
  
  req.body.name = req.body.name.toUpperCase();
  if (await couponModel.findOne({ name: req.body.name })) {
    return next(new Error("Duplicated coupon name", { cause: 409 }));
  }
  const customId = nanoid();
  if (req.file) {
    const couponImage = await cloudinary.uploader.upload(req.file.path, {
      folder: `${process.env.APP_NAME}/Coupon/${customId}`,
      public_id: `${customId}couponImage`,
    });
    req.body.imageURL = couponImage.secure_url;
  }
  req.body.customId = customId;
  req.body.createdBy = req.user._id;
  const coupon = await couponModel.create(req.body);
  if (!coupon) {
    return next(new Error("Fail to create coupon", { cause: 400 }));
  }
  return res.status(201).json({
    status: "success",
    message: "coupon created successfully",
    result: coupon,
  });
});

//====================================================================================================================//
//get coupons
export const getCoupons = async (req, res, next) => {
  const coupon = await couponModel.find({});
  return res.status(200).json({
    status: "success",
    message: "Done",
    result: coupon,
  });
};

//====================================================================================================================//
//update coupon
export const updateCoupon = asyncHandler(async (req, res, next) => {
  const coupon = await couponModel.findById(req.params.couponId);

  //check coupon exist
  if (!coupon) {
    return next(new Error("In-valid coupon id", { cause: 404 }));
  }
  if (!(req.body.name || req.body.amount || req.file||req.body.expire)) {
    return next(
      new Error("coupon name ,amount ,expire date or coupon image is required to update", {
        cause: 404,
      })
    );
  }

  //update name
  if (req.body.name) {
    req.body.name = req.body.name.toUpperCase();
    if (coupon.name === req.body.name) {
      return next(
        new Error("You can't update coupon name with the same old name", {
          cause: 409,
        })
      );
    }
    if (await couponModel.findOne({ name: req.body.name })) {
      return next(new Error("Duplicated coupon name", { cause: 409 }));
    }
  }

  //update coupon image
  if (req.file) {
    const couponImage = await cloudinary.uploader.upload(req.file.path, {
      folder: `${process.env.APP_NAME}/Coupon/${coupon.customId}`,
      public_id: `${coupon.customId}couponImage`,
    });
    req.body.imageURL = couponImage.secure_url;
  }
  req.body.updatedBy = req.user._id;
  const couponIpdated=await couponModel.findByIdAndUpdate({_id:req.params.couponId},req.body,{new:true})
  return res.status(200).json({
    status: "success",
    message: "coupon updated successfully",
    result: couponIpdated,
  });
});
