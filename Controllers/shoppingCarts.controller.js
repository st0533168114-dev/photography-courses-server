import mongoose from "mongoose";
import shoppingCarts from "../Models/shoppingCart.js";
import course from "../Models/course.js";
import { resolveCart } from "../Services/shoppingCart.service.js";

const ShoppingCartsController = {

  getAllCarts: async (req, res) => {
    try {
      const shoppingCartsList = await shoppingCarts.find({});
      res.status(200).json(shoppingCartsList);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch shopping carts" });
    }
  },

  getByUserId: async (req, res) => {
    const userId = req.user.userId;
    try {
      const shoppingCart = await shoppingCarts.findOne({ userId: userId });
      // מוחזרת עגלה ריקה ולא 404, כדי שהלקוח יוכל להציג עגלה גם למשתמש שטרם יצר אחת
      if (!shoppingCart) {
        return res.status(200).json({ userId, subtotal: 0, courseList: [] });
      }
      res.status(200).json(await resolveCart(shoppingCart));
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch shopping cart" });
    }
  },


  clearCart: async (req, res) => {
    const userId = req.user.userId;
    try {
      const updateShoppingCart = await shoppingCarts.findOneAndUpdate(
        { userId: userId },
        // איפוס הרשימה במקום מחיקת המסמך, כדי שהמשתמש ימשיך להחזיק באותה עגלה
        { $set: { courseList: [] } },
        {
          new: true,
          runValidators: true,
        }
      );
      if (!updateShoppingCart) {
        return res.status(404).json({ message: "Shopping cart not found" });
      }
      res.status(200).json(updateShoppingCart);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Clear cart failed" });
    }
  },

  addToCart: async (req, res) => {
    const userId = req.user.userId;
    const { courseId } = req.body;

    if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid or missing course id" });
    }

    try {
      const courseDetails = await course.findById(courseId);
      if (!courseDetails) {
        return res.status(404).json({ message: "Course not found" });
      }

      if (courseDetails.status !== "available") {
        return res.status(400).json({ message: "הקורס אינו זמין לרכישה כעת" });
      }

      // יצירת העגלה מופרדת מההוספה: upsert יחד עם תנאי ה-$ne שלמטה היה יוצר עגלה נוספת
      // כשהקורס כבר קיים, במקום להימנע מהוספה
      await shoppingCarts.findOneAndUpdate(
        { userId: userId },
        { $setOnInsert: { userId: userId, courseList: [] } },
        { upsert: true }
      );

      const updatedCart = await shoppingCarts.findOneAndUpdate(
        {
          userId: userId,
          "courseList.courseId": { $ne: new mongoose.Types.ObjectId(courseId) },
        },
        {
          $push: {
            courseList: {
              courseId: courseId,
              price: courseDetails.price,
            },
          },
        },
        { new: true }
      );

      // תוצאה ריקה כאן משמעותה שהתנאי לא התקיים, כלומר הקורס כבר בעגלה
      if (!updatedCart) {
        const existingCart = await shoppingCarts.findOne({ userId: userId });
        return res.status(200).json(await resolveCart(existingCart));
      }

      return res.status(200).json(await resolveCart(updatedCart));
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Add to cart failed" });
    }
  },
  removeFromCart: async (req, res) => {
    const userId = req.user.userId;
    const { courseId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid course id" });
    }
    try {
      const currentShoppingCart = await shoppingCarts.findOne({ userId: userId });
      if (!currentShoppingCart) return res.status(404).json({ message: "Shopping cart not found" });
      const isInCart = currentShoppingCart.courseList.some(
        (course) => course.courseId.toString() === courseId
      );

      if (!isInCart) {
        return res.status(404).json({ message: "Course not found in cart" });
      }
      const updateShoppingCart = await shoppingCarts.findOneAndUpdate(
        { userId: userId },
        {
          $pull: {
            courseList: {
              courseId: new mongoose.Types.ObjectId(courseId),
            },
          },
        },
        {
          new: true,
          runValidators: true, // Mongoose לא מריץ ולידציה בעדכון אלא אם מבקשים במפורש
        }
      );

      res.status(200).json(await resolveCart(updateShoppingCart));
    } catch (error) {
      res.status(500).json({ error: "remove from cart failed" + error });
    }
  },

};


export default ShoppingCartsController;
