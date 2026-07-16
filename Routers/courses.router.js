import express from "express";
import CoursesController from "../Controllers/courses.controller.js";
import jwtMiddleware from "../Middlewares/jwt.middleware.js"; // ייבוא ה-Middleware
import isAdminMiddleware from "../Middlewares/isAdmin.middleware.js"; // ייבוא ה-Middleware
const CoursesRouter = express.Router();

CoursesRouter.get("/", CoursesController.get);
CoursesRouter.get("/category/:id", CoursesController.getByCategoryId);
CoursesRouter.get("/:id", CoursesController.getById);
CoursesRouter.post("/", jwtMiddleware, isAdminMiddleware, CoursesController.post);
CoursesRouter.put("/:id", jwtMiddleware, isAdminMiddleware, CoursesController.put);
CoursesRouter.delete("/:id", jwtMiddleware, isAdminMiddleware, CoursesController.delete);

export default CoursesRouter;
