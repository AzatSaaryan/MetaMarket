import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectToDatabase from "./db/db.js";
import userRouter from "./users/userRouter.js";
import authRouter from "./auth/authRouter.js";
import nftRouter from "./NFTs/nftRouter.js";

dotenv.config();
const PORT = process.env.PORT || 3000;
const app: Express = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGINS || "http://localhost:5000",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/NFTs", nftRouter);

connectToDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
  });
});
