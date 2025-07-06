import express from "express";
import authController from "./authController.js";

const authRouter = express.Router();

authRouter.post("/generate-nonce", authController.generateNonce);
authRouter.post("/login", authController.login);
authRouter.post("/logout", authController.logout);

export default authRouter;
