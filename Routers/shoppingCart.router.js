import express from "express";
import ShoppingCartsController from "../Controllers/shoppingCarts.controller.js";
import jwtMiddleware from "../Middlewares/jwt.middleware.js";
import isAdminMiddleware from "../Middlewares/isAdmin.middleware.js";
const ShoppingCartsRouter = express.Router();


//למנהל
ShoppingCartsRouter.get("/admin/all",jwtMiddleware,isAdminMiddleware,ShoppingCartsController.getAllCarts);
//למשתמש
ShoppingCartsRouter.get("/", jwtMiddleware, ShoppingCartsController.getByUserId);
ShoppingCartsRouter.post("/items", jwtMiddleware, ShoppingCartsController.addToCart);
ShoppingCartsRouter.delete("/items/:courseId", jwtMiddleware, ShoppingCartsController.removeFromCart);
ShoppingCartsRouter.delete("/items", jwtMiddleware, ShoppingCartsController.clearCart);
export default ShoppingCartsRouter;
