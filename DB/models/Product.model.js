import mongoose, { model, Schema, Types } from "mongoose";

const productSchema = new Schema(
  {
    customId: String,
    mainImageURL: { type: String, required: true },
    subImages: { type: [Object] },
    name: { type: String, unique: true, required: true, trim: true },
    slug: { type: String, required: true },
    description: { type: String, required: true },
    stock: { type: Number, required: true, default: 1 },
    price: { type: Number, required: true, default: 1 },
    discount: { type: Number, default: 0 },
    finalPrice: { type: Number, required: true, default: 1 },
    colors: [String],
    size: {
      type: [String],
      enum: ["s", "m", "lg", "xl"],
    },
    categoryId: { type: Types.ObjectId, ref: "Category", required: true },
    subCategoryId: { type: Types.ObjectId, ref: "Subcategory", required: true },
    brandId: { type: Types.ObjectId, ref: "Brand", required: true },
    wishUser: [{ type: Types.ObjectId, ref: "User"}],
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Types.ObjectId, ref: "User" },
    isDeleted: { type: Boolean, default: false },
  },
  {
    toJSON:{virtuals:true},
    toObject:{virtuals:true},
    timestamps: true,
  }
);

productSchema.pre("find", function () {
  this.where({ isDeleted: false });
});

//virtual populate to review model
productSchema.virtual("review" ,
{
  ref:"Review",
  localField:'_id',
  foreignField:'productId'
})

productSchema.virtual("mainProductImagePublicId").get(function () {
  return `${process.env.APP_NAME}/Product/${this.customId}/mainImage/${this.customId}mainProductImage`;
});
productSchema.virtual("subProductImagePublicId").get(function () {
  for (let index = 0; index < this.subImages?.length; index++) {
    return `${process.env.APP_NAME}/Product/${this.customId}/subImages/${this.subImages[index].public_id}`;
  }
});

const productModel = mongoose.models.Product || model("Product", productSchema);
export default productModel;
