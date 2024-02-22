import authRouter from "./modules/Auth/auth.router.js";
import userRouter from "./modules/User/user.router.js";
import categoryRouter from "./modules/category/category.router.js";
import subcategoryRouter from "./modules/subcategory/subcategory.router.js";
import couponRouter from "./modules/coupon/coupon.router.js";
import branRouter from "./modules/brand/brand.router.js";
import productRouter from "./modules/product/product.router.js";
import cartRouter from "./modules/cart/cart.router.js";
import orderRouter from "./modules/order/order.router.js";
import reviewsRouter from "./modules/reviews/reviews.router.js";
import connectDB from "../DB/connection.js";
import { glopalErrHandling } from "./utils/errorHandling.js";
import morgan from "morgan";
import cors from "cors";

const initApp = (app, express) => {
  //add cors
  // app.use(cors())

  app.use(async (req, res, next) => {
    
    //   await res.header("Access-Control-Allow-Origin", [origin]);
    
    await res.header("Access-Control-Allow-Origin", "*");
    await res.header("Access-Control-Allow-Headers", "*");
    await res.header("Access-Control-Private-Network", "true");
    await res.header("Access-Control-Allow-Methods", "*");
    next();
  });

  app.use(morgan("dev"));

  app.use(express.json({}));

  app.use("/auth", authRouter);

  app.use("/user", userRouter);

  app.use(`/category`, categoryRouter);

  app.use(`/subCategory`, subcategoryRouter);

  app.use(`/coupon`, couponRouter);

  app.use(`/brand`, branRouter);

  app.use(`/product`, productRouter);

  app.use(`/cart`, cartRouter);

  app.use(`/order`, orderRouter);

  app.use(`/reviews`, reviewsRouter);

  app.all("*", (req, res, next) => {
    return res.status(404).json({ message: "error 404 in-valid routing" });
  });

  app.use(glopalErrHandling);

  //connect DataBase
  connectDB();
};

export default initApp;
