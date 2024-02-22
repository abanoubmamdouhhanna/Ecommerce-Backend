import subcategoryModel from "../../../../DB/models/Subcategory.model .js";
import cloudinary from "../../../utils/cloudinary.js";
import slugify from "slugify";
import { asyncHandler } from "../../../utils/errorHandling.js";
import categoryModel from "../../../../DB/models/Category.model.js";
import { nanoid } from "nanoid";

//create subcategory
export const createSubcategory = asyncHandler(async (req, res, next) => {
  const { categoryId } = req.params;
  const category = await categoryModel.findById(categoryId);
  if (!category) {
    return next(new Error("In-valid category id", { cause: 404 }));
  }
  if (!req.file) {
    return next(new Error("Subcategory image is required"));
  }
  //capitalize only first letter
  const name =
    req.body.name.charAt(0).toUpperCase() +
    req.body.name.slice(1).toLowerCase();

    if (await subcategoryModel.findOne({ name })) {
      return next(new Error("Duplicated subcategory name", { cause: 409 }));
    }

  const customId = nanoid();
  const subcategoryImage = await cloudinary.uploader.upload(req.file.path, {
    folder: `${process.env.APP_NAME}/category/${categoryId}/${customId}`,
    public_id: `${customId}subcategoryImage`,
  });
  const subcategory = await subcategoryModel.create({
    name,
    slug: slugify(name, "_"),
    categoryId,
    customId,
    createdBy: req.user._id,
    imageURL: subcategoryImage.secure_url,
  });
  if (!subcategory) {
    return next(new Error("Fail to create Subcategory", { cause: 400 }));
  }
  return res.status(201).json({
    status: "success",
    message: "Subcategory created successfully",
    result: subcategory,
  });
});

//====================================================================================================================//
//get Subcategories
export const getSubCategories = asyncHandler(async (req, res, next) => {
  const subcategory = await subcategoryModel.find({});
  return res.status(200).json({
    status: "success",
    message: "Done",
    result: subcategory,
  });
});

//====================================================================================================================//
//update subcategory
export const updateSubcategory = asyncHandler(async (req, res, next) => {
  const { categoryId, subcategoryId } = req.params;
  const subcategory = await subcategoryModel.findOne({
    _id: subcategoryId,
    categoryId,
  });
  if (!subcategory) {
    return next(new Error("In-valid subcategory id", { cause: 404 }));
  }
  if (!(req.body.name || req.file)) {
    return next(
      new Error("subcategory name or subcategory image is required to update", {
        cause: 404,
      })
    );
  }

  if (req.body.name) {
    const name =
      req.body.name.charAt(0).toUpperCase() +
      req.body.name.slice(1).toLowerCase();
    if (subcategory.name === name) {
      return next(
        new Error("You can't update subcategory name with the same old name", {
          cause: 409,
        })
      );
    }
    if (await subcategoryModel.findOne({ name })) {
      return next(new Error("Duplicated subcategory name", { cause: 409 }));
    }
    req.body.name = name;
    req.body.slug = slugify(name, "_");
  }

  if (req.file) {
    const subcategoryImage = await cloudinary.uploader.upload(req.file.path, {
      folder: `${process.env.APP_NAME}/category/${categoryId}/${subcategory.customId}`,
      public_id: `${subcategory._id}subcategoryImage`,
    });
    req.body.imageURL = subcategoryImage.secure_url;
  }

  req.body.updatedBy = req.user._id;
  const updatedSubcategory = await subcategoryModel.findOneAndUpdate(
    { _id: subcategoryId, categoryId },
    req.body,
    { new: true }
  );
  return res.status(200).json({
    status: "success",
    message: "Subcategory updated successfully",
    result: updatedSubcategory,
  });
});
