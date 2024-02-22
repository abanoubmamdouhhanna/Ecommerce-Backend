import { nanoid } from "nanoid";
import { createInvoice } from "../../../utils/pdf.js";
import cartModel from "../../../../DB/models/Cart.model.js";
import couponModel from "../../../../DB/models/Coupon.model.js";
import orderModel from "../../../../DB/models/Order.model.js";
import productModel from "../../../../DB/models/Product.model.js";
import { asyncHandler } from "../../../utils/errorHandling.js";
import {
  clearAllCartItems,
  clearSelectedItems,
} from "../../cart/controller/cart.controller.js";
import { fileURLToPath } from "url";
import path from "path";
import cloudinary from "../../../utils/cloudinary.js";
import { unlink } from "fs";
import sendEmail from "../../../utils/Emails/sendEmail.js";
import payment from "../../../utils/payment.js";
import Stripe from "stripe";

//create order
export const createOrder = asyncHandler(async (req, res, next) => {
  const { address, phone, couponName, note, paymentType } = req.body;

  //check coupon valid
  if (couponName) {
    const coupon = await couponModel.findOne({
      name: couponName.toUpperCase(),
      usedBy: { $nin: req.user._id },
      isDeleted: false,
    });
    if (!coupon || Date.now() > coupon?.expire?.getTime()) {
      return next(new Error("In-valid or expire coupon", { cause: 400 }));
    }
    req.body.coupon = coupon;
  }
  if (!req.body.products) {
    //check cart products
    const cart = await cartModel.findOne({ createdBy: req.user._id });
    if (!cart?.products.length) {
      return next(new Error("Empty Cart", { cause: 400 }));
    }
    req.body.products = cart.products;
    req.body.isCart = true;
  }

  //calculate total price
  let sumTotal = 0;
  let finalProductList = [];
  let productIds = [];
  for (let product of req.body.products) {
    const checkProduct = await productModel.findOne({
      _id: product.productId,
      stock: { $gte: product.quantity },
      isDeleted: false,
    });
    if (!checkProduct) {
      return next(
        new Error(`Fail to add this product `, {
          cause: 400,
        })
      );
    }
    productIds.push(product.productId);
    if (req.body.isCart) {
      product = product.toObject();
    }
    product.name = checkProduct.name;
    product.unitPrice = checkProduct.finalPrice;
    product.description = checkProduct.description;
    product.finalPrice = product.unitPrice * product.quantity;
    finalProductList.push(product);

    sumTotal += product.finalPrice;
  }

  //final order
  const order = await orderModel.create({
    userId: req.user._id,
    address,
    phone,
    products: finalProductList,
    couponId: req.body.coupon?._id,
    finalPrice: Number(
      parseFloat(
        sumTotal - sumTotal * ((req.body.coupon?.amount || 0) / 100)
      ).toFixed(2)
    ),
    paymentType,
  });
  if (!order) {
    return next(new Error("Fail to place your oeder"));
  }

  //reduce quantity
  for (const product of req.body.products) {
    await productModel.updateOne(
      { _id: product.productId },
      { $inc: { stock: -parseInt(product.quantity) } }
    );
  }

  //update uses of coupon
  if (couponName) {
    await couponModel.updateOne(
      { _id: req.body.coupon._id },
      { $addToSet: { usedBy: req.user._id } }
    );
  }
  if (!req.body.products) {
    //empty all cart products if not selected products
    await clearAllCartItems(req.user._id);
  } else {
    //remove selected products from cart
    await clearSelectedItems(productIds, req.user._id);
  }
  //invoice pdf
  const invoice = {
    shipping: {
      name: req.user.firstName + " " + req.user.lastName,
      address: order.address,
      city: "Cairo",
      state: "Cairo",
      country: "Egypt",
      postal_code: 94111,
    },
    items: order.products,
    subtotal: sumTotal,
    Discount: couponName ? `${req.body.coupon.amount} ` : 0,
    invoice_nr: order._id,
    finalPrice: order.finalPrice,
    date: order.createdAt,
  };
  if (process.env.MOOD == "DEV") {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const pdfPath = path.join(
      __dirname,
      `../../../../src/invoices/invoice${invoice.invoice_nr}.pdf`
    );
    createInvoice(invoice, pdfPath);
    //upload invoice to cloudinary

    const { secure_url, public_id } = await cloudinary.uploader.upload(
      pdfPath,
      {
        folder: `${process.env.APP_NAME}/order/invoice`,
        resource_type: "raw",
      }
    );

    if (secure_url) {
      order.invoice.url = secure_url;
      order.invoice.id = public_id;
      await order.save();

      unlink(pdfPath, (err) => {
        if (err) console.log(err);
        else {
          console.log("file deleted");
        }
      });
    }
    await sendEmail({
      to: req.user.email,
      subject: "Order Invoice",
      attachments: [
        {
          path: secure_url,
          contentType: "application/pdf",
        },
      ],
    });
  } else {
    const pdfPath = `/tmp/invoice${invoice.invoice_nr}.pdf`;
    createInvoice(invoice, pdfPath);

    //upload invoice to cloudinary
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      pdfPath,
      {
        folder: `${process.env.APP_NAME}/order/invoice`,
        resource_type: "raw",
      }
    );

    if (secure_url) {
      order.invoice.url = secure_url;
      order.invoice.id = public_id;
      await order.save();
    }
    await sendEmail({
      to: req.user.email,
      subject: "Order Invoice",
      attachments: [
        {
          path: secure_url,
          contentType: "application/pdf",
        },
      ],
    });
  }

  if (paymentType == "Card" && order.status == "Pending") {
    const stripe = new Stripe(process.env.STRIPE_KEY);
    if (req.body.coupon) {
      const coupon = await stripe.coupons.create({
        percent_off: req.body.coupon.amount,
        duration: "once",
      });
      req.body.couponId = coupon.id;
    }

    const session = await payment({
      stripe,
      payment_method_types: ["card"],
      mode: "payment",
      cancel_ur: `${req.protocol}://${
        req.headers.host
      }/order/payment/cancel?orderId=${order._id.toString()}`,
      customer_email: req.user.email,
      metadata: {
        orderId: order._id.toString(),
      },
      line_items: order.products.map((product) => {
        return {
          price_data: {
            currency: "egp",
            product_data: { name: product.name },
            unit_amount: product.unitPrice * 100,
          },
          quantity: product.quantity,
        };
      }),
      discounts:req.body.couponId? [{ coupon:  req.body.couponId }]:[],
    });
    order.status = "Processing";
    await order.save();

    return res.status(201).json({
      status: "success",
      message: "Order shipped successfully",
      Url: session.url,
      _id:order._id
      // order: order,
    });
  } else if (["Delivered", "Shipped"].includes(order.status)) {
    return next(
      new Error("This order is already checked out ", { cause: 400 })
    );
  } else {
    order.status = "Shipped";
    await order.save();
    return res.status(201).json({
      status: "success",
      message: "Order placed successfully",
      result: order,
    });
  }
});
//====================================================================================================================//
//cancel order
export const CancelOrder = asyncHandler(async (req, res, next) => {
  const { orderId } = req.params;
  const { reason } = req.body;
  const order = await orderModel.findOne({
    _id: orderId,
    userId: req.user._id,
  });
  if (!order) {
    return next(new Error("In-valid order id", { cause: 404 }));
  }
  if (
    (order.status != "Pending" && order.paymentType == "COD") ||
    (order.status != "On hold" && order.paymentType != "COD")
  ) {
    return next(
      new Error(
        `We're sorry, but we're unable to cancel your order at this time. It appears that your order's status and payment type combination is invalid for cancellation.`,
        { cause: 404 }
      )
    );
  }

  //delete invoice from cloudinary
  await cloudinary.uploader.destroy(
    `${order.invoice.id}`,
    { resource_type: "raw" },
    function (error, result) {
      console.log(result, error);
    }
  );

  const cancelOrder = await orderModel.updateOne(
    { _id: orderId, userId: req.user._id },
    { status: "Cancelled", reason, $unset: { invoice: 1 } }
  );
  if (!cancelOrder.matchedCount) {
    return next(new Error(`Fail to cancel your order`, { cause: 400 }));
  }
  //return quantity
  for (const product of order.products) {
    await productModel.updateOne(
      { _id: product.productId },
      { $inc: { stock: parseInt(product.quantity) } }
    );
  }

  //remover user from used by coupon list
  if (order.couponId) {
    await couponModel.updateOne(
      { _id: order.couponId },
      { $pull: { usedBy: req.user._id } }
    );
  }
  return res
    .status(200)
    .json({ status: "success", message: "Order canceled successfully" });
});

//====================================================================================================================//
//orderd delivered
export const deliveredOrder = asyncHandler(async (req, res, next) => {
  const { orderId } = req.params;
  const order = await orderModel.findOne({
    _id: orderId,
  });
  if (!order) {
    return next(new Error("In-valid order id", { cause: 404 }));
  }
  if (["Delivered", "Cancelled", "Rejected"].includes(order.status)) {
    return next(
      new Error(
        `We regret to inform you that we were unable to deliver your order with id: ${orderId} after status has been changed to ${order.status}.`,
        { cause: 404 }
      )
    );
  }
  const deliveredOrder = await orderModel.updateOne(
    { _id: orderId },
    { status: "Delivered", updatedBy: req.user._id }
  );
  return res.status(200).json({
    status: "success",
    message: "Order delivered successfully",
    result: deliveredOrder,
  });
});
