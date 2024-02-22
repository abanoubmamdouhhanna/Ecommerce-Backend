import mongoose, { model, Schema, Types } from "mongoose";

const cartSchema = new Schema(
  {
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    products: [
      {
        productId: { type: Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, default:1 },
      },
    ],
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

cartSchema.pre("find", function () {
  this.where({ isDeleted: false });
});

const cartModel = mongoose.models.Cart || model("Cart", cartSchema);
export default cartModel;
