import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

// משתמש המערכת. courseIds מקשר ל-courses ומתעדכן בעת יצירת הזמנה שהתשלום עליה הצליח (orders.controller)
const UserSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  // ייחודי כדי למנוע שני חשבונות על אותה כתובת
  email: {
    type: String,
    required: true,
    unique: true,
  },
  // מזהה ההתחברות בפועל, ולכן חייב להיות ייחודי
  userName: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  // ברירת המחדל user כדי שהרשמה ציבורית לא תוכל ליצור מנהל
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
  // הקורסים שהמשתמש רכש - מקור האמת לגישה לאזור "הקורסים שלי"
  courseIds: {
    type: [ObjectId],
    ref: "courses",
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
});
export default mongoose.model("users", UserSchema);
