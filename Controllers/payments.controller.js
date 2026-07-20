import mongoose from "mongoose";
import payments from "../Models/payment.js";

// לוגיקה פנימית ליצירת תשלום - נקראת גם ישירות מ-OrdersController
async function createPayment({ orderId, paymentDate, status, paymentNumber, paymentMethod, transactionId }) {
  // יצירת אובייקט תשלום חדש לפי הסכמה של המודל
  const newPayment = new payments({
    orderId,
    paymentDate,
    status,
    paymentNumber,
    paymentMethod,
    transactionId,
  });
  // שמירת התשלום החדש במסד הנתונים
  await newPayment.save();
  // החזרת התשלום שנשמר לקורא הפונקציה
  return newPayment;
}

const PaymentsController = {
  get: async (req, res) => {
    try {
      // שליפת כל התשלומים מהמסד
      const paymentsList = await payments.find({});
      // החזרת רשימת התשלומים ללקוח בסטטוס תקין
      res.status(200).json(paymentsList);
    } catch (error) {
      // במקרה שגיאה מוחזר הודעת השגיאה בלבד ולא כל אובייקט השגיאה
      res.status(500).json({ error: error.message });
    }
  },
  //לבדוק אותה
  getById: async (req, res) => {
    // שליפת מזהה התשלום מפרמטרי הבקשה
    const id = req.params.id;
    try {
      //  תביא גם את נתוני ההזמנה:
      const payment = await payments.findById(id).populate("orderId");

      // בדיקה אם התשלום לא נמצא במסד
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }

      // בדיקה האם המשתמש הוא הבעלים של ההזמנה המשויכת לתשלום
      const isOrderOwner = payment.orderId && payment.orderId.userId.toString() === req.user.userId;
      // חסימת גישה למי שאינו בעלים ואינו מנהל
      if (!isOrderOwner && req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied. Unauthorized." });
      }
      // החזרת התשלום ללקוח לאחר אימות ההרשאה
      res.status(200).json(payment);
    } catch (error) {
      // במקרה שגיאה מוחזרת רק הודעת השגיאה
      res.status(500).json({ error: error.message });
    }
  },

  // הוספת תשלום באופן ידני - כולל סינון נתונים לאבטחה מפני Mass Assignment
  post: async (req, res) => {
    try {
      // חילוץ השדות המורשים בלבד מגוף הבקשה, למניעת הזרקת נתונים רגישים מהלקוח (כמו transactionId)
      const { orderId, paymentDate, paymentNumber, paymentMethod } = req.body;

      // בניית אובייקט הנתונים עם סטטוס ברירת מחדל מאובטח
      const paymentData = {
        orderId,
        paymentDate,
        status: "pending", // סטטוס בטוח השנשלט על ידי השרת (מערכת הסליקה תעדכן בהמשך)
        paymentNumber,
        paymentMethod,
      };

      // יצירת תשלום חדש באופן מאובטח לפי הנתונים שחולצו
      const newPayment = await createPayment(paymentData);
      // החזרת התשלום שנוצר בסטטוס יצירה מוצלחת
      res.status(201).json(newPayment);
    } catch (error) {
      // במקרה שגיאה מוחזרת רק הודעת השגיאה
      res.status(500).json({ error: error.message });
    }
  },

  put: async (req, res) => {
    // שליפת מזהה התשלום מפרמטרי הבקשה
    const { id } = req.params;
    // גוף הבקשה עם הנתונים המעודכנים לתשלום
    const payment = req.body;
    try {
      // עדכון התשלום במסד לפי המזהה
      const updatedPayment = await payments.findByIdAndUpdate(id, payment, {
        new: true,
        runValidators: true, // כדי לבצע ולידציה - זה לא קורה אוטומטית בעדכון
      });

      // בדיקה אם התשלום לעדכון לא נמצא
      if (!updatedPayment) {
        return res.status(404).json({ message: "Payment not found" });
      }

      // החזרת התשלום המעודכן ללקוח
      res.status(200).json(updatedPayment);
    } catch (error) {
      // במקרה שגיאת ולידציה או שגיאה כללית מוחזר סטטוס 400 עם הודעת השגיאה
      res.status(400).json({ error: error.message });
    }
  },
  //יהיה צריך לשנות למחיקה רכה
  delete: async (req, res) => {
    // שליפת מזהה התשלום מפרמטרי הבקשה
    const id = req.params.id;
    try {
      // מחיקת התשלום מהמסד לפי המזהה
      const deletedPayment = await payments.findByIdAndDelete(id);
      // בדיקה אם התשלום למחיקה לא נמצא
      if (!deletedPayment) {
        return res.status(404).json({ message: "Payment not found" });
      }
      // החזרת התשלום שנמחק ללקוח
      res.status(200).json(deletedPayment);
    } catch (error) {
      // במקרה שגיאה מוחזרת רק הודעת השגיאה
      res.status(500).json({ error: error.message });
    }
  },
};

export default PaymentsController;
export { createPayment };