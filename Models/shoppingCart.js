import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema.Types;

const ShoppingCartSchema = new mongoose.Schema({
  userId: {
    type: ObjectId,
    ref: "users",
    required: true,
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
      // המחיר מרגע ההוספה, ומשמש רק לזיהוי שינוי מחיר להצגה למשתמש - לא לתצוגה ולא לחיוב
      price: {
        type: Number,
        required: true,
      },
    },
  ],
});

export default mongoose.model("ShoppingCart", ShoppingCartSchema, "shoppingCarts");
