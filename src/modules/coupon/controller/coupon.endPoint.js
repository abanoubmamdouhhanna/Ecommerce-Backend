import { roles } from "../../../middlewares/auth.middleware.js";

export const endPoint = {
  create: [roles.Admin, roles.SuperAdmin],
  update: [roles.Admin, roles.SuperAdmin],
};
