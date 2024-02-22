import { roles } from "../../../middlewares/auth.middleware.js";

export const endPoint = {
  create: [roles.User,roles.Admin,roles.SuperAdmin],
  update: [roles.User,roles.Admin,roles.SuperAdmin],
};
