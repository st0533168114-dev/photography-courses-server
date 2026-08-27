import mongoose from "mongoose";

// שאלות נפוצות - ישות עצמאית ללא קשר לשאר ה-collections
const FaqSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
});

export default mongoose.model("faqs", FaqSchema);
