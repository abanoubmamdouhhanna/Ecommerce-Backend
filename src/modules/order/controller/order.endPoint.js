import { roles } from "../../../middlewares/auth.middleware.js";

export const endPoint = {
  create: [roles.User,roles.Admin,roles.SuperAdmin],
  cancel: [roles.User,roles.Admin,roles.SuperAdmin],
  delivered: [roles.Admin,roles.SuperAdmin],
};
