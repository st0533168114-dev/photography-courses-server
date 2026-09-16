import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema.Types;

// הזמנה של משתמש. מקשרת בין users, courses ו-payments, ומשמשת גם כתיעוד היסטורי של הרכישה
const OrderSchema = new mongoose.Schema({
  userId: {
    type: ObjectId,
    ref: "users",
    required: true,
  },
  // המחיר והשם נשמרים כאן כעותק מרגע הרכישה, כדי ששינוי בקורס בעתיד לא ישנה הזמנות ישנות
  coursesList: {
    type: [
      {
        courseId: { type: ObjectId, ref: "courses" },
        courseName: String,
        price: Number,
      },
    ],
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  // מערך ולא שדה בודד כדי לאפשר יותר מתשלום אחד להזמנה בעתיד
  paymentsList: {
    type: [ObjectId],
    ref: "payments",
    default: [],
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
  // ההזמנה נוצרת כ-incomplete ומסומנת completed רק אחרי תשלום שהצליח
  status: {
    type: String,
    enum: ["completed", "incomplete", "cancelled", "refunded"],
    default: "incomplete",
  },
});

export default mongoose.model("orders", OrderSchema);
