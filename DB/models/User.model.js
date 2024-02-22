import mongoose, { model, Schema, Types } from "mongoose";

const userSchema = new Schema(
  {
    userName: {
      type: String,
      min: 3,
      max: 20,
      lowercase: true,
      required: [true, "userName is required"],
      unique: true,
    },
    firstName: {
      type: String,
      min: 3,
      max: 20,
      required: [true, "firstName is required"],
     },
    lastName: {
      type: String,
      min: 3,
      max: 20,
      required: [true, "lastName is required"],
     },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    age: {
      type: Number,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "not Active",
      enum: ["Active", "not Active"],
    },
    role: {
      type: String,
      default: "user",
      enum: ["superAdmin", "admin", "user"],
    },
    gender: {
      type: String,
      default: "male",
      enum: ["male", "female"],
      required: true,
    },
    isConfirmed: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    wishlist: [{ type: Types.ObjectId, ref: "Product" }],
    DOB: Date,
    activationCode: String,
    otp: String,
    otpexp: Date,
    permanentlyDeleted: Date,
    profileURL: String,
    coverURL: String,
    changeAccountInfo: Date,
  },
  { timestamps: true }
);
userSchema.pre("find", function () {
  this.where({ isDeleted: false });
});

userSchema.virtual("profilePicId").get(function () {
  return `${process.env.APP_NAME}/users/${this._id}/profile/${this._id}profilePic`;
});



const UserModel = mongoose.models.User || model("User", userSchema);
export default UserModel;
