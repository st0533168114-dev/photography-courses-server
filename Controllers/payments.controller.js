import mongoose from "mongoose";
import payments from "../Models/payment.js";

// מיוצאת בנפרד כדי ש-OrdersController ייצור תשלום ישירות, בלי לעבור דרך שכבת ה-HTTP
async function createPayment({ orderId, paymentDate, status, paymentNumber, paymentMethod, transactionId }) {
  const newPayment = new payments({
    orderId,
    paymentDate,
    status,
    paymentNumber,
    paymentMethod,
    transactionId,
  });
  await newPayment.save();
  return newPayment;
}

const PaymentsController = {
  get: async (req, res) => {
    try {
      const paymentsList = await payments.find({});
      res.status(200).json(paymentsList);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getById: async (req, res) => {
    const id = req.params.id;
    try {
      // populate נדרש כדי לבדוק בעלות - היא נקבעת לפי בעל ההזמנה ולא לפי התשלום עצמו
      const payment = await payments.findById(id).populate("orderId");

      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }

      const isOrderOwner = payment.orderId && payment.orderId.userId.toString() === req.user.userId;
      if (!isOrderOwner && req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied. Unauthorized." });
      }
      res.status(200).json(payment);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  post: async (req, res) => {
    try {
      // חילוץ שדות מפורש ולא req.body ישירות, כדי שהלקוח לא יוכל להזריק transactionId או status
      const { orderId, paymentDate, paymentNumber, paymentMethod } = req.body;

      const paymentData = {
        orderId,
        paymentDate,
        status: "pending", // הסטטוס נקבע בשרת בלבד - מערכת הסליקה תעדכן אותו בהמשך
        paymentNumber,
        paymentMethod,
      };

      const newPayment = await createPayment(paymentData);
      res.status(201).json(newPayment);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  put: async (req, res) => {
    const { id } = req.params;
    const payment = req.body;
    try {
      const updatedPayment = await payments.findByIdAndUpdate(id, payment, {
        new: true,
        runValidators: true, // Mongoose לא מריץ ולידציה בעדכון אלא אם מבקשים במפורש
      });

      if (!updatedPayment) {
        return res.status(404).json({ message: "Payment not found" });
      }

      res.status(200).json(updatedPayment);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  delete: async (req, res) => {
    const id = req.params.id;
    try {
      const deletedPayment = await payments.findByIdAndDelete(id);
      if (!deletedPayment) {
        return res.status(404).json({ message: "Payment not found" });
      }
      res.status(200).json(deletedPayment);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

export default PaymentsController;
export { createPayment };
