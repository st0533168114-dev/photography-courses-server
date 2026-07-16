import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema.Types;
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
  paymentNumber: {
    type: Number,
    required: true,
    default: 1,
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  transactionId: {
    type: String,
    required: true,
    unique: true,
  },
});

export default mongoose.model("payments", PaymentSchema);
