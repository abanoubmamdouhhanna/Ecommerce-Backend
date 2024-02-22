import slugify from "slugify";
import subcategoryModel from "../../../../DB/models/Subcategory.model .js";
import brandModel from "../../../../DB/models/Brand.model.js";
import cloudinary from "../../../utils/cloudinary.js";
import { nanoid } from "nanoid";
import productModel from "../../../../DB/models/Product.model.js";
import { asyncHandler } from "../../../utils/errorHandling.js";
import UserModel from "../../../../DB/models/User.model.js";
import { ApiFeatures } from "../../../utils/apiFeatures.js";

//get products
export const productList = asyncHandler(async (req, res, next) => {
  const apiObject = new ApiFeatures(productModel.find().populate([
    {
      path:'review'
    }
  ]), req.query)
    .paginate()
    .filter()
    .search()
    .sort()
    .select();
  const products = await apiObject.mongooseQuery;
  //  calc avg rating
  for (let i = 0; i < products.length; i++) {
    let calcRate = 0;
    for (let j = 0; j < products[i].review?.length; j++) {
      calcRate += products[i].review[j].rating;
    }
    const product = products[i].toObject();
    product.avgRating = calcRate / products[i].review?.length;
    products[i] = product;
  }
  return res.status(200).json({
    status: "success",
    message: "Done",
    result: products,
  });
});
//====================================================================================================================//
//create product
export const createProduct = asyncHandler(async (req, res, next) => {
  const { name, price, categoryId, subCategoryId, brandId, discount } =
    req.body;
  if (!(await subcategoryModel.findOne({ _id: subCategoryId, categoryId }))) {
    return next(
      new Error("In-valid subcategoryId or categoryId", { cause: 400 })
    );
  }
  if (!(await brandModel.findOne({ _id: brandId }))) {
    return next(new Error("In-valid brandId", { cause: 400 }));
  }

  req.body.customId = nanoid();
  req.body.slug = slugify(name);
  req.body.finalPrice = Number.parseFloat(
    price - price * ((discount || 0) / 100)
  ).toFixed(2);

  const mainImage = await cloudinary.uploader.upload(
    req.files.mainImage[0].path,
    {
      folder: `${process.env.APP_NAME}/Product/${req.body.customId}/mainImage`,
      public_id: `${req.body.customId}mainProductImage`,
    }
  );
  req.body.mainImageURL = mainImage.secure_url;

  if (req.files?.subImages?.length) {
    let counter = 1;
    req.body.subImages = [];
    for (const image of req.files.subImages) {
      const subImagesUpload = await cloudinary.uploader.upload(image.path, {
        folder: `${process.env.APP_NAME}/Product/${req.body.customId}/subImages`,
        public_id: `${req.body.customId}subProductImage___${counter}`,
      });
      req.body.subImages.push({
        url: subImagesUpload.secure_url,
        public_id: subImagesUpload.public_id,
      });
      counter++;
    }
  }
  req.body.createdBy = req.user._id;
  const product = await productModel.create(req.body);
  return res.status(201).json({
    status: "success",
    message: "Product Created successfully",
    result: product,
  });
});
//====================================================================================================================//
//update product

export const updateProduct = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const { name, price, categoryId, subCategoryId, brandId, discount } =
    req.body;

  const product = await productModel.findById(productId);
  if (!product) {
    return next(new Error("In-valid product Id ", { cause: 400 }));
  }

  if (subCategoryId && categoryId) {
    if (!(await subcategoryModel.findOne({ _id: subCategoryId, categoryId }))) {
      return next(
        new Error("In-valid subcategoryId or categoryId", { cause: 400 })
      );
    }
  }

  if (brandId) {
    if (!(await brandModel.findOne({ _id: brandId }))) {
      return next(new Error("In-valid brandId", { cause: 400 }));
    }
  }
  //update name
  if (name) {
    req.body.slug = slugify(name);
  }

  //update price or discount
  req.body.finalPrice =
    price || discount
      ? Number.parseFloat(
          (price || product.price) -
            (price || product.price) * ((discount || product.discount) / 100)
        ).toFixed(2)
      : product.finalPrice;

  //update image
  if (req.files?.mainImage?.length) {
    const mainImage = await cloudinary.uploader.upload(
      req.files.mainImage[0].path,
      {
        folder: `${process.env.APP_NAME}/Product/${product.customId}/mainImage`,
        public_id: `${product.customId}mainProductImage`,
      }
    );
    req.body.mainImageURL = mainImage.secure_url;
  }

  if (req.files?.subImages?.length) {
    let counter = 1;
    req.body.subImages = [];
    for (const image of req.files.subImages) {
      const subImagesUpload = await cloudinary.uploader.upload(image.path, {
        folder: `${process.env.APP_NAME}/Product/${product.customId}/subImages`,
        public_id: `${product.customId}subProductImage___${counter}`,
      });
      req.body.subImages.push({
        url: subImagesUpload.secure_url,
        public_id: subImagesUpload.public_id,
      });
      counter++;
    }
  }

  req.body.updatedBy = req.user._id;
  const productUpdated = await productModel.findByIdAndUpdate(
    { _id: productId },
    req.body,
    { new: true }
  );
  return res.status(200).json({
    status: "success",
    message: "Product updated successfully",
    result: productUpdated,
  });
});
//====================================================================================================================//
//wishlist

export const wishlist = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  if (!(await productModel.findOne({ _id: productId, isDeleted: false }))) {
    return next(new Error("In-valid product", { cause: 400 }));
  }
  await UserModel.updateOne(
    { _id: req.user._id },
    { $addToSet: { wishlist: productId } }
  );
  return res
    .status(200)
    .json({ status: "success", message: "Added to wishlist" });
});
//====================================================================================================================//
//remove From Wishlist

export const removeFromWishlist = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;

  await UserModel.updateOne(
    { _id: req.user._id },
    { $pull: { wishlist: productId } }
  );
  return res
    .status(200)
    .json({ status: "success", message: "removed from wishlist" });
});
