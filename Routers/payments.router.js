import express from "express";
import jwtMiddleware from "../Middlewares/jwt.middleware.js"; // ייבוא ה-Middleware
import isAdminMiddleware from "../Middlewares/isAdmin.middleware.js"; // ייבוא ה-Middleware

import PaymentsController from "../Controllers/payments.controller.js";
const PaymentsRouter = express.Router();

PaymentsRouter.get("/", jwtMiddleware, isAdminMiddleware, PaymentsController.get);
PaymentsRouter.get("/:id", jwtMiddleware, PaymentsController.getById);
PaymentsRouter.post("/", jwtMiddleware, PaymentsController.post);
PaymentsRouter.put("/:id", jwtMiddleware, isAdminMiddleware, PaymentsController.put);
PaymentsRouter.delete("/:id", jwtMiddleware, isAdminMiddleware, PaymentsController.delete);
export default PaymentsRouter;
