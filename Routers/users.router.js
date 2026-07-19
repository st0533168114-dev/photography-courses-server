import express from "express";
import UsersController from "../Controllers/users.controller.js";
import jwtMiddleware from "../Middlewares/jwt.middleware.js";
import isAdminMiddleware from "../Middlewares/isAdmin.middleware.js";
const UsersRouter = express.Router();

UsersRouter.post("/login", UsersController.login);
UsersRouter.post("/register", UsersController.post);

UsersRouter.get("/profile", jwtMiddleware, UsersController.getProfile);
UsersRouter.get("/", jwtMiddleware, isAdminMiddleware, UsersController.get);
UsersRouter.get("/:id", jwtMiddleware, isAdminMiddleware, UsersController.getById);
UsersRouter.post("/", UsersController.post);
UsersRouter.put("/:id", jwtMiddleware, UsersController.put);
UsersRouter.delete("/:id", jwtMiddleware, UsersController.delete);
export default UsersRouter;
