import "dotenv/config";
import express from "express";
import usersRouter from "./Routers/users.router.js";
import ordersRouter from "./Routers/orders.router.js";
import coursesRouter from "./Routers/courses.router.js";
import ShoppingCartsRouter from "./Routers/shoppingCart.router.js";
import PaymentsRouter from "./Routers/payments.router.js";
import CategoriesRouter from "./Routers/categories.router.js";
import FaqRouter from "./Routers/faq.router.js";
import cors from "cors";
import mongoose from "mongoose";
//************** */
//בגלל שהתמונות הן מתקיה מקומית-אישור גישה לשרת אל התיקיה המקומית
// 1. ייבוא המודולים  
import path from 'path';
import { fileURLToPath } from 'url';
//************** */

//import { MONGO_URI } from './config.js'

const app = express();
const mongoUri = process.env.MONGO_URI;
app.use(express.json());

app.use(cors());

//************** */
//בגלל שהתמונות הן מתקיה מקומית-אישור גישה לשרת אל התיקיה המקומית
// 1. ייבוא המודולים בשיטת ES Modules

// 2. יצירת תואם ל-__dirname עבור ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 3. הגדרת תיקיית התמונות כסטטית 
app.use('/images', express.static(path.join(__dirname, 'Images/OutImages')));
//************** */


// הגדרת פורט שרת מתוך משתני סביבה או שימוש בבררת מחדל-כדי שירוץ ברנדר
const PORT = process.env.PORT || 1234;
app.listen(PORT, () => {
  console.log(`running port:${PORT}`);
});
const connectDB = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log("connect DB sucssful!");
  } catch (err) {
    console.log("error" + err);
  }
};
connectDB();

//בדקתי את שניהם
app.use("/users", usersRouter);
app.use("/orders", ordersRouter);
app.use("/courses", coursesRouter); //לכאורה בדקתי
app.use("/shoppingCarts", ShoppingCartsRouter); //לא בדקתי אבל תיקנתי שגיאות
app.use("/payments", PaymentsRouter); //לא בדקתי
app.use("/categories", CategoriesRouter); //לא בדקתי
app.use("/faq", FaqRouter);
