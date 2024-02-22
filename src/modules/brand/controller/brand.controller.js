import brandModel from "../../../../DB/models/Brand.model.js";
import cloudinary from "../../../utils/cloudinary.js";
import { asyncHandler } from "../../../utils/errorHandling.js";
import { nanoid } from "nanoid";

//create brand
export const createBrand = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new Error("brand image is required"));
  }
  //capitalize only first letter
  const name =
    req.body.name.charAt(0).toUpperCase() +
    req.body.name.slice(1).toLowerCase();
  if (await brandModel.findOne({ name })) {
    return next(new Error("Duplicated brand name", { cause: 409 }));
  }
  const customId = nanoid();
  const brandImage = await cloudinary.uploader.upload(req.file.path, {
    folder: `${process.env.APP_NAME}/Brand/${customId}`,
    public_id: `${customId}brandImage`,
  });
  const brand = await brandModel.create({
    name,
    customId,
    createdBy: req.user._id,
    imageURL: brandImage.secure_url,
  });
  if (!brand) {
    return next(new Error("Fail to create brand", { cause: 400 }));
  }

  return res.status(201).json({
    status: "success",
    message: "brand created successfully",
    result: brand,
  });
});

//====================================================================================================================//
//get brands
export const getBrands = async (req, res, next) => {
  const brand = await brandModel.find({});
  return res.status(200).json({
    status: "success",
    message: "Done",
    result: brand,
  });
};

//====================================================================================================================//
//update brand
export const updateBrand = asyncHandler(async (req, res, next) => {
  const brand = await brandModel.findById(req.params.brandId);
  if (!brand) {
    return next(new Error("In-valid brand id", { cause: 404 }));
  }

  if (!(req.body.name || req.file)) {
    return next(
      new Error("brand name or brand image is required to update", {
        cause: 404,
      })
    );
  }

  if (req.body.name) {
    const name =
      req.body.name.charAt(0).toUpperCase() +
      req.body.name.slice(1).toLowerCase();
    if (brand.name === name) {
      return next(
        new Error("You can't update brand name with the same old name", {
          cause: 409,
        })
      );
    }
    if (await brandModel.findOne({ name })) {
      return next(new Error("Duplicated brand name", { cause: 409 }));
    }
    brand.name = req.body.name;
  }

  if (req.file) {
    const brandImage = await cloudinary.uploader.upload(req.file.path, {
      folder: `${process.env.APP_NAME}/Brand/${brand._id}`,
      public_id: `${brand._id}brandImage`,
    });
    brand.imageURL = brandImage.secure_url;
  }
  brand.updatedBy = req.user._id;
  await brand.save();
  return res.status(200).json({
    status: "success",
    message: "brand updated successfully",
    result: brand,
  });
});
