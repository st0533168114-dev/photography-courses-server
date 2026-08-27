import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema.Types;

// עגלה אחת פעילה לכל משתמש ב-users. פרטי הקורס משוכפלים לתוכה לצורך תצוגה,
// אך ביצירת הזמנה המחיר נשלף מחדש מ-courses ולא נלקח מכאן
const ShoppingCartSchema = new mongoose.Schema({
  userId: {
    type: ObjectId,
    ref: "users",
    required: true,
  },
  subtotal: {
    type: Number,
    required: true,
    default: 0,
  },
  courseList: [
    {
      // אין צורך במזהה נפרד לפריט בעגלה - courseId מזהה אותו באופן ייחודי
      _id: false,
      courseId: {
        type: ObjectId,
        ref: "courses",
        required: true,
      },
      courseName: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      courseImage: {
        type: String,
        required: true,
      },
    },
  ],
});

export default mongoose.model("ShoppingCart", ShoppingCartSchema, "shoppingCarts");
