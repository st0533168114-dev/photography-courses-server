import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema.Types;

// קטגוריה שאליה משויכים קורסים ב-courses. מחיקה נחסמת כל עוד יש קורסים משויכים (category.controller)
const CategorySchema = new mongoose.Schema({
  // ייחודי כדי למנוע שתי קטגוריות זהות ברשימת הבחירה בטופס הקורס
  categoryName: {
    type: String,
    required: true,
    unique: true,
  },
});

export default mongoose.model("categories", CategorySchema);
