import { roles } from "../../../middlewares/auth.middleware.js";

export const endPoint = {
    logOut: [roles.User]
};
