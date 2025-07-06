import express from "express";
import userController from "./userController.js";

const userRouter = express.Router();

userRouter.put("/:id", userController.updateUser);

export default userRouter;
