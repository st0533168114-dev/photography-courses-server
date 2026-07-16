import express from "express";
import OrdersController from "../Controllers/orders.controller.js";
import jwtMiddleware from "../Middlewares/jwt.middleware.js";
import isAdminMiddleware from "../Middlewares/isAdmin.middleware.js";
//לא בדקתי אחרי הוספת גוט
//רק מול גמיני
const OrdersRouter = express.Router();
//לא בדקתייייייי אחרי שינויים
OrdersRouter.get("/", jwtMiddleware, isAdminMiddleware, OrdersController.get);
OrdersRouter.get("/user-orders", jwtMiddleware, OrdersController.getUserOrders);
OrdersRouter.get("/:id", jwtMiddleware, OrdersController.getById);
OrdersRouter.post("/", jwtMiddleware, OrdersController.post);
OrdersRouter.put("/:id", jwtMiddleware, isAdminMiddleware, OrdersController.put);
OrdersRouter.delete("/:id", jwtMiddleware, isAdminMiddleware, OrdersController.delete);
export default OrdersRouter;
