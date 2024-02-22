import mongoose, { model, Schema, Types } from "mongoose";

const reviewSchema = new Schema(
  {
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Types.ObjectId, ref: "User" },
    productId: { type: Types.ObjectId, ref: "Product", required: true },
    orderId: { type: Types.ObjectId, ref: "Order", required: true },
    comment: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

reviewSchema.pre("find", function () {
  this.where({ isDeleted: false });
});

const reviewModel = mongoose.models.Review || model("Review", reviewSchema);
export default reviewModel;
