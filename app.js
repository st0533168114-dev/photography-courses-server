
import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import usersRouter from "./Routers/users.router.js";
import ordersRouter from "./Routers/orders.router.js";
import coursesRouter from "./Routers/courses.router.js";
import shoppingCartsRouter from "./Routers/shoppingCart.router.js";
import paymentsRouter from "./Routers/payments.router.js";
import categoriesRouter from "./Routers/categories.router.js";
import faqRouter from "./Routers/faq.router.js";

const __filename = fileURLToPath(import.meta.url); // ממיר את כתובת ה-URL של הקובץ לנתיב רגיל במערכת הקבצים
const __dirname = path.dirname(__filename); // מחלץ מהנתיב המלא רק את שם התיקייה שבה נמצא הקובץ

const app = express();
const PORT = process.env.PORT || 1234;
const MONGO_URI = process.env.MONGO_URI;

// Middlewares
app.use(cors());
app.use(express.json());

// גישה סטטית לתמונות מהתיקייה המקומית
app.use("/images", express.static(path.join(__dirname, "Images/OutImages")));

// חיבור למסד הנתונים
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to DB successfully!");
  } catch (err) {
    console.error("DB connection error:", err);
  }
};
connectDB();

// Routes
app.use("/users", usersRouter);
app.use("/orders", ordersRouter);
app.use("/courses", coursesRouter);
app.use("/shoppingCarts", shoppingCartsRouter);
app.use("/payments", paymentsRouter);
app.use("/categories", categoriesRouter);
app.use("/faq", faqRouter);

// הפעלת השרת - רק בסוף, אחרי שכל ה-middleware וה-routes מוגדרים
app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});




