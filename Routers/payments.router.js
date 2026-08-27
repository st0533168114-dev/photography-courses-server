import express from "express";
import jwtMiddleware from "../Middlewares/jwt.middleware.js";
import isAdminMiddleware from "../Middlewares/isAdmin.middleware.js";

import PaymentsController from "../Controllers/payments.controller.js";
const PaymentsRouter = express.Router();

PaymentsRouter.get("/", jwtMiddleware, isAdminMiddleware, PaymentsController.get);
PaymentsRouter.get("/:id", jwtMiddleware, PaymentsController.getById);
// יצירת תשלום ידנית מוגבלת למנהל - תשלום של משתמש נוצר רק כחלק מיצירת הזמנה
PaymentsRouter.post("/", jwtMiddleware, isAdminMiddleware, PaymentsController.post);
PaymentsRouter.put("/:id", jwtMiddleware, isAdminMiddleware, PaymentsController.put);
PaymentsRouter.delete("/:id", jwtMiddleware, isAdminMiddleware, PaymentsController.delete);
export default PaymentsRouter;
