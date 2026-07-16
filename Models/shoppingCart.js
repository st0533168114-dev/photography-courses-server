import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema.Types;

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