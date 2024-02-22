import categoryModel from "../../../../DB/models/Category.model.js";
import cloudinary from "../../../utils/cloudinary.js";
import slugify from "slugify";
import { asyncHandler } from "../../../utils/errorHandling.js";
import { nanoid } from "nanoid";

//create category
export const createCategory = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new Error("category image is required"));
  }
  //capitalize only first letter
  const name =
    req.body.name.charAt(0).toUpperCase() +
    req.body.name.slice(1).toLowerCase();

  if (await categoryModel.findOne({ name })) {
    return next(new Error("Duplicated category name", { cause: 409 }));
  }

  const customId = nanoid();
  const categoryImage = await cloudinary.uploader.upload(req.file.path, {
    folder: `${process.env.APP_NAME}/Category/${customId}`,
    public_id: `${customId}categoryImage`,
  });
  const category = await categoryModel.create({
    name,
    slug: slugify(name, "_"),
    customId,
    createdBy: req.user._id,
    imageURL: categoryImage.secure_url,
  });
  if (!category) {
    return next(new Error("Fail to create category", { cause: 400 }));
  }

  return res.status(201).json({
    status: "success",
    message: "Category created successfully",
    result: category,
  });
});

//====================================================================================================================//
//get categories
export const getCategories = async (req, res, next) => {
  const category = await categoryModel.find({}).populate([
    {
      path: "SubCategories",
    },
  ]);
  return res.status(200).json({
    status: "success",
    message: "Done",
    result: category,
  });
};

//====================================================================================================================//
//update Category
export const updateCategory = asyncHandler(async (req, res, next) => {
  const category = await categoryModel.findById(req.params.categoryId);
  if (!category) {
    return next(new Error("In-valid Category id", { cause: 404 }));
  }
  if (!(req.body.name || req.file)) {
    return next(
      new Error("Category name or Category image is required to update", {
        cause: 404,
      })
    );
  }
  if (req.body.name) {
    const name =
      req.body.name.charAt(0).toUpperCase() +
      req.body.name.slice(1).toLowerCase();
    if (category.name === name) {
      return next(
        new Error("You can't update category name with the same old name", {
          cause: 409,
        })
      );
    }
    if (await categoryModel.findOne({ name })) {
      return next(new Error("Duplicated category name", { cause: 409 }));
    }
    req.body.name = name;
    req.body.slug = slugify(name, "_");
  }

  if (req.file) {
    const categoryImage = await cloudinary.uploader.upload(req.file.path, {
      folder: `${process.env.APP_NAME}/Category/${category._id}`,
      public_id: `${category._id}categoryImage`,
    });
    req.body.imageURL = categoryImage.secure_url;
  }
  req.body.updatedBy = req.user._id;
  // await category.save();
  const updatedCategory = await categoryModel.findOneAndUpdate(
    { _id: req.params.categoryId },
    req.body,
    { new: true }
  );
  return res.status(200).json({
    status: "success",
    message: "Category updated successfully",
    result: updatedCategory,
  });
});
