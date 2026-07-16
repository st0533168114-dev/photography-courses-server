import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema.Types;
const OrderSchema = new mongoose.Schema({
  userId: {
    type: ObjectId,
    ref: "users",
    required: true,
  },
  coursesList: {
    type: [
      {
        courseId: { type: ObjectId, ref: "courses" },
        price: Number,
      },
    ],
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  paymentsList: {
    type: [ObjectId],
    ref: "payments",
    default: [],
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["completed", "incomplete"],
    default: "incomplete",
  },
});

export default mongoose.model("orders", OrderSchema);
