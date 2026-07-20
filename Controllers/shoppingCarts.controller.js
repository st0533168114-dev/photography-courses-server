import mongoose from "mongoose";
import shoppingCarts from "../Models/shoppingCart.js";
import course from "../Models/course.js";

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
      if (!shoppingCart) {
        return res.status(200).json({ userId, subtotal: 0, courseList: [] });
      }
      res.status(200).json(shoppingCart);
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
        { $set: { courseList: [], subtotal: 0 } },// שינוי רק של הערכים האלו באוביקט במקום למחוק את העגלה
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

      // שלב 1: נוודא שיש עגלה למשתמש, אם אין ניצור עגלה ריקה
      await shoppingCarts.findOneAndUpdate(
        { userId: userId },
        { $setOnInsert: { userId: userId, courseList: [], subtotal: 0 } },
        { upsert: true }
      );

      // שלב 2: נוסיף את הקורס לעגלה רק אם הוא לא קיים בה כבר
      const updatedCart = await shoppingCarts.findOneAndUpdate(
        {
          userId: userId,
          "courseList.courseId": { $ne: new mongoose.Types.ObjectId(courseId) },
        },
        {
          $push: {
            courseList: {
              courseId: courseId,
              courseName: courseDetails.courseName,
              price: courseDetails.price,
              courseImage: courseDetails.courseImage,
            },
          },
          $inc: { subtotal: courseDetails.price },
        },
        { new: true }
      );

      // אם העגלה לא התעדכנה, זה אומר שהקורס כבר קיים בה
      if (!updatedCart) {
        const existingCart = await shoppingCarts.findOne({ userId: userId });
        return res.status(200).json(existingCart);
      }

      return res.status(200).json(updatedCart);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Add to cart failed" });
    }
  },
  removeFromCart: async (req, res) => {
    const userId = req.user.userId;
    const { courseId } = req.params;
    // תיקון: ולידציה על courseId שמגיע מה-params
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid course id" });
    }
    try {
      //מציאת העגלה כדי לדעת מה המחיר של הקורס שאני רוצה למחוק
      const currentShoppingCart = await shoppingCarts.findOne({ userId: userId });
      if (!currentShoppingCart) return res.status(404).json({ message: "Shopping cart not found" });
      const courseToRemove = currentShoppingCart.courseList.find(
        (course) => course.courseId.toString() === courseId
      );

      if (!courseToRemove) {
        return res.status(404).json({ message: "Course not found in cart" });
      }
      const updateShoppingCart = await shoppingCarts.findOneAndUpdate(
        { userId: userId },
        {
          // מסיר את הפריט מהמערך courseList 
          $pull: {
            courseList: {
              courseId: new mongoose.Types.ObjectId(courseId),
            },
          },
          // מוריד את מחיר הקורס מהסכום הכולל של העגלה
          $inc: { subtotal: -courseToRemove.price },
        },
        {
          new: true,
          runValidators: true, // כדי לבצע ולידציה- זה לא קורה אוטומטית בעדכון
        }
      );

      res.status(200).json(updateShoppingCart);
    } catch (error) {
      res.status(500).json({ error: "remove from cart failed" + error });
    }
  },

};
 

export default ShoppingCartsController;
















