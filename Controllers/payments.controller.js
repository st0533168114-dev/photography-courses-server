import mongoose from "mongoose";
import payments from "../Models/payment.js";

// לוגיקה פנימית ליצירת תשלום - נקראת גם ישירות מ-OrdersController
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
      res.status(500).json({ error: error });
    }
  },
  //לבדוק אותה
  getById: async (req, res) => {
    const id = req.params.id;
    try {
      //  תביא גם את נתוני ההזמנה:
      const payment = await payments.findById(id).populate("orderId");

      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }

      const isOrderOwner = payment.orderId && payment.orderId.userId.toString() === req.user.userId;
      if (!isOrderOwner && req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied. Unauthorized." });
      }
      const paymentData = await payments.findById(id);
      if (!paymentData) {
        return res.status(404).json({ message: "Payment not found" });
      }
      res.status(200).json(paymentData);
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },

  post: async (req, res) => {
    try {
      const newPayment = await createPayment(req.body);
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
        runValidators: true, // כדי לבצע ולידציה - זה לא קורה אוטומטית בעדכון
      });

      if (!updatedPayment) {
        return res.status(404).json({ message: "Payment not found" });
      }

      res.status(200).json(updatedPayment);
    } catch (error) {
      res.status(404).json({ error: "Payment update failed" + error });
    }
  },
  //יהיה צריך לשנות למחיקה רכה
  delete: async (req, res) => {
    const id = req.params.id;
    try {
      const deletedPayment = await payments.findByIdAndDelete(id);
      if (!deletedPayment) {
        return res.status(404).json({ message: "Payment not found" });
      }
      res.status(200).json(deletedPayment);
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },
};

export default PaymentsController;
export { createPayment };
