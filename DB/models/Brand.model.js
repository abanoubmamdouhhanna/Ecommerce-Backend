import mongoose, { model, Schema, Types } from "mongoose";

const brandSchema = new Schema(
  {
    imageURL: {type:String ,required:true},
    customId: String,
    name: { type: String, unique: true, required: true },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Types.ObjectId, ref: "User" },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

brandSchema.pre("find", function () {
  this.where({ isDeleted: false });
});

brandSchema.virtual("brandImagePublicId").get(function () {
  return `${process.env.APP_NAME}/Brand/${this.customId}/${this.customId}brandImage`;
})

const brandModel = mongoose.models.Brand || model("Brand", brandSchema);
export default brandModel;
