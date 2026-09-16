import mongoose from "mongoose";
import crypto from "crypto";
import orders from "../Models/order.js";
import shoppingCarts from "../Models/shoppingCart.js";
import users from "../Models/user.js";
import { createPayment } from "./payments.controller.js";
import { resolveCart } from "../Services/shoppingCart.service.js";

const OrdersController = {
  get: async (req, res) => {
    try {
      const filter = req.query.userId ? { userId: req.query.userId } : {};

      const ordersList = await orders
        .find(filter)
        .populate("userId", "firstName lastName email")
        .populate("paymentsList")
        .sort({ orderDate: -1 });
      res.status(200).json(ordersList);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  getUserOrders: async (req, res) => {
    try {
      const userId = req.user.userId; // מגיע מהטוקן המפוענח ב-jwtMiddleware ולא מהלקוח

      const userOrders = await orders
        .find({ userId: userId })
        .populate("paymentsList")
        .sort({ orderDate: -1 });
      res.status(200).json(userOrders);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  getById: async (req, res) => {
    const orderId = req.params.id;
    const userId = req.user.userId;
    const userRole = req.user.role;
    try {
      const order = await orders
        .findById(orderId)
        .populate("userId", "firstName lastName email")
        .populate("paymentsList");
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      if (order.userId?._id.toString() !== userId && userRole !== "admin") {
        return res.status(403).json({ message: "Unauthorized to view this order" });
      }
      res.status(200).json(order);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // ההזמנה נבנית בשרת מתוך עגלת הקניות של המשתמש - גוף הבקשה אינו משמש
  post: async (req, res) => {
    try {
      const userId = req.user.userId;
      const userCart = await shoppingCarts.findOne({ userId: userId });
      if (!userCart || userCart.courseList.length === 0) {
        return res.status(400).json({ message: "Cannot place an order with an empty cart" });
      }

      const resolvedCart = await resolveCart(userCart);

      const unavailableCourse = resolvedCart.courseList.find((item) => !item.isAvailable);
      if (unavailableCourse) {
        return res
          .status(400)
          .json({ message: `הקורס "${unavailableCourse.courseName}" אינו זמין לרכישה כעת` });
      }

      if (resolvedCart.courseList.length === 0) {
        return res.status(400).json({ message: "Cannot place an order with an empty cart" });
      }

      const buyer = await users.findById(userId).select("courseIds");
      const ownedCourseIds = (buyer?.courseIds || []).map((id) => id.toString());
      const alreadyOwnedCourse = resolvedCart.courseList.find((item) =>
        ownedCourseIds.includes(item.courseId.toString())
      );
      if (alreadyOwnedCourse) {
        return res
          .status(400)
          .json({ message: `הקורס "${alreadyOwnedCourse.courseName}" כבר נרכש` });
      }

      const coursesList = resolvedCart.courseList.map((item) => ({
        courseId: item.courseId,
        price: item.price,
      }));
      const totalAmount = resolvedCart.subtotal;

      const newOrder = new orders({
        userId: userId,
        coursesList,
        totalAmount,
      });

      await newOrder.save();

      // אין עדיין אינטגרציה עם ספק סליקה אמיתי, לכן כל פרטי התשלום מומצאים אוטומטית בשרת
      const paymentsResult = await createPayment({
        orderId: newOrder._id,
        status: "success",
        paymentNumber: 1,
        paymentMethod: "כרטיס אשראי",
        transactionId: crypto.randomUUID(),
      });

      newOrder.paymentsList = newOrder.paymentsList || [];
      newOrder.paymentsList.push(paymentsResult._id);
      let updatedUser = null;
      if (paymentsResult.status === "success") {
        newOrder.status = "completed";

        // הוספת הקורסים למשתמש היא מה שפותח לו את הגישה לקורס, ולכן קורית רק אחרי תשלום מוצלח
        const purchasedCourseIds = coursesList.map((course) => course.courseId);
        updatedUser = await users.findByIdAndUpdate(
          userId,
          {
            $addToSet: {
              courseIds: {
                $each: purchasedCourseIds,
              },
            },
          },
          { new: true }
        ).select("-password");
        if (!updatedUser) {
          throw new Error("User not found");
        }
      }

      await newOrder.save();

      res.status(201).json({
        order: newOrder,
        payments: paymentsResult,
        user: updatedUser,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  },

  put: async (req, res) => {
    const { id } = req.params;
    const order = req.body;
    try {
      const updatedOrder = await orders.findByIdAndUpdate(id, order, {
        new: true,
        runValidators: true, // Mongoose לא מריץ ולידציה בעדכון אלא אם מבקשים במפורש
      });

      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.status(200).json(updatedOrder);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
export default OrdersController;
