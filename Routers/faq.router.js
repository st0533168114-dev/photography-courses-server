import express from "express";
import jwtMiddleware from "../Middlewares/jwt.middleware.js";
import isAdminMiddleware from "../Middlewares/isAdmin.middleware.js";
import FaqController from "../Controllers/faq.controller.js";

const FaqRouter = express.Router();

FaqRouter.get("/", FaqController.get);
FaqRouter.post("/", jwtMiddleware, isAdminMiddleware, FaqController.post);
FaqRouter.put("/:id", jwtMiddleware, isAdminMiddleware, FaqController.put);
FaqRouter.delete("/:id", jwtMiddleware, isAdminMiddleware, FaqController.delete);

export default FaqRouter;
