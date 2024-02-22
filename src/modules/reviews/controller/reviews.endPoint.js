import { roles } from "../../../middlewares/auth.middleware.js";

export const endPoint = {
  create: [roles.User],
  update: [roles.User],
};
