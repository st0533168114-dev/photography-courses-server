import mongoose from "mongoose";
import crypto from "crypto";
import orders from "../Models/order.js";
import shoppingCarts from "../Models/shoppingCart.js";
import courses from "../Models/course.js";
import users from "../Models/user.js";
import { createPayment } from "./payments.controller.js";

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

      const userOrders = await orders.find({ userId: userId }).sort({ orderDate: -1 });
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

      const courseIds = userCart.courseList.map((item) => item.courseId);
      const coursesFromDb = await courses.find({ _id: { $in: courseIds } });

      const unavailableCourse = coursesFromDb.find((course) => course.status !== "available");
      if (unavailableCourse) {
        return res.status(400).json({ message: `Course "${unavailableCourse.courseName}" is no longer available` });
      }

      const priceByCourseId = new Map(coursesFromDb.map((course) => [course._id.toString(), course.price]));

      // המחיר נלקח מהמסד ולא מהעגלה, כדי שלקוח לא יוכל לשלוט במחיר ששולם
      const coursesList = userCart.courseList.map((item) => {
        const currentPrice = priceByCourseId.get(item.courseId.toString());
        if (currentPrice === undefined) {
          throw new Error(`Course ${item.courseId} not found`);
        }
        return { courseId: item.courseId, price: currentPrice };
      });
      const totalAmount = coursesList.reduce((sum, course) => sum + course.price, 0);

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
            $push: {
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
        user: updatedUser ,
      });
    } catch (error) {
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
  delete: async (req, res) => {
    const id = req.params.id;
    try {
      const deleteOrder = await orders.findByIdAndDelete(id);
      if (!deleteOrder) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.status(200).json(deleteOrder);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
export default OrdersController;
