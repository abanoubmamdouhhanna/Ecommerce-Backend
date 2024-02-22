import mongoose, { model, Schema, Types } from "mongoose";

const subcategorySchema = new Schema(
  {
    name: { type: String,unique:true,required: true },
    slug: { type: String, required: true },
    imageURL: {type:String ,required:true},
    customId:String,
    categoryId: { type: Types.ObjectId, ref: "Category", required: true }, 
    createdBy: { type: Types.ObjectId, ref: "User", required: true }, 
    updatedBy: { type: Types.ObjectId, ref: "User"}, 
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

subcategorySchema.pre("find", function () {
  this.where({ isDeleted: false });
});

subcategorySchema.virtual("subcategoryImagePublicId").get(function () {
  return `${process.env.APP_NAME}/category/${this.categoryId}/${this.customId}/${this.customId}subcategoryImage`
});

const subcategoryModel =
  mongoose.models.Subcategory || model("Subcategory", subcategorySchema);
export default subcategoryModel;
