import { roles } from "../../../middlewares/auth.middleware.js";

export const endPoint = {
  get: [roles.User ,roles.Admin, roles.SuperAdmin],
  update: [roles.User ,roles.Admin, roles.SuperAdmin],
  delete: [roles.User, roles.Admin, roles.SuperAdmin],
};
