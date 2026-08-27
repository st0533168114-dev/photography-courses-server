import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema.Types;

// קורס בקטלוג. categoryId מקשר ל-categories, והמחיר כאן הוא מקור האמת בעת יצירת הזמנה
const CourseSchema = mongoose.Schema({
  courseName: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  youtubeLink: String,
  // תמונת ברירת מחדל כדי שקורס בלי תמונה לא ישבור את התצוגה בלקוח
  courseImage: {
    type: String,
    required: true,
    trim: true,
    default: "ImagesOutImages0738_-canon_600.jpeg",
  },
  categoryId: {
    type: ObjectId,
    ref: "categories",
    required: true,
  },
  // קורס שאינו available נחסם לרכישה ביצירת הזמנה (orders.controller)
  status: {
    type: String,
    enum: ["available", "notAvailable"],
    default: "available",
  },
  courseDescription: {
    type: String,
     default: "",
  },
  courseContent: {
    type: [String],
    default: [],
  },
  images: {
    type: [String],
    default: [],
  },
});
export default mongoose.model("courses", CourseSchema);
