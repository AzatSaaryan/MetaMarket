import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import nftController from "./nftController.js";
import { uploadImageMiddleware } from "../middlewares/uploadImageMiddleware.js";

const nftRouter = express.Router();

nftRouter.post(
  "/create-nft",
  authMiddleware,
  uploadImageMiddleware,
  nftController.createNFT
);

export default nftRouter;
