import express from "express";
import jwtMiddleware from "../Middlewares/jwt.middleware.js"; // ייבוא ה-Middleware
import isAdminMiddleware from "../Middlewares/isAdmin.middleware.js"; // ייבוא ה-Middleware

import CategoriesController from "../Controllers/category.controller.js";
const CategoriesRouter = express.Router();
//לא בדקתי אחרי הוספת גוט

CategoriesRouter.get("/", CategoriesController.get);
CategoriesRouter.get("/:id", CategoriesController.getById);
CategoriesRouter.post("/", jwtMiddleware, isAdminMiddleware, CategoriesController.post);
CategoriesRouter.put("/:id", jwtMiddleware, isAdminMiddleware, CategoriesController.put);
CategoriesRouter.delete("/:id", jwtMiddleware, isAdminMiddleware, CategoriesController.delete);
export default CategoriesRouter;
