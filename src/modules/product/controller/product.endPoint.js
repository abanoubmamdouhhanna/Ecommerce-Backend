import { roles } from "../../../middlewares/auth.middleware.js";

export const endPoint = {
  create: [roles.User,roles.Admin],
  update: [roles.User, roles.SuperAdmin],
  wishlist:[roles.User]
};
