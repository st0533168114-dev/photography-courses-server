import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema.Types;

// תשלום המשויך להזמנה אחת ב-orders. נוצר אוטומטית ביצירת הזמנה, בלי ספק סליקה חיצוני
const PaymentSchema = new mongoose.Schema({
  orderId: {
    type: ObjectId,
    ref: "orders",
    required: true,
  },
  paymentDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["success", "failed"],
    default: "success",
  },
  // מספר התשלום בתוך ההזמנה - כרגע תמיד 1 כי אין תשלומים מרובים
  paymentNumber: {
    type: Number,
    required: true,
    default: 1,
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  // מזהה העסקה מול הסליקה - ייחודי כדי למנוע רישום כפול של אותו חיוב
  transactionId: {
    type: String,
    required: true,
    unique: true,
  },
});

export default mongoose.model("payments", PaymentSchema);
