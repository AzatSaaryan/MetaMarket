import authService from "./authService.js";
import { Request, Response, RequestHandler } from "express";
import { deleteRefreshToken } from "../utils/authUtils.js";
import { isAddress } from "ethers";

class AuthController {
  public generateNonce: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    try {
      const walletAddress = req.body.walletAddress;
      if (!walletAddress || !isAddress(walletAddress)) {
        res.status(400).json({ message: "Invalid or missing wallet address" });
        return;
      }
      const nonce = await authService.generateNonce(walletAddress);
      res.status(200).json({ nonce });
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error generating nonce in controller:", error.message);
        res.status(500).json({ message: error.message });
      }
      return;
    }
  };

  public login: RequestHandler = async (req: Request, res: Response) => {
    const { walletAddress, signature } = req.body;
    const existingWalletAddress = req.cookies.walletAddress;
    const existingAccessToken = req.cookies.accessToken;

    if (existingWalletAddress || existingAccessToken) {
      res.status(400).json({ message: "User already logged in" });
      return;
    }

    if (!walletAddress || !isAddress(walletAddress) || !signature) {
      res.status(400).json({ message: "Invalid wallet address or signature" });
      return;
    }
    try {
      const { accessToken, user } = await authService.login(
        walletAddress,
        signature
      );
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 15 * 60 * 1000,
      });
      res.cookie("walletAddress", walletAddress, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        message: "User logged in successfully",
        user,
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error logging in user:", error.message);
        if (error.message === "Invalid signature") {
          res.status(401).json({ message: "Invalid signature" });
          return;
        }
        res.status(401).json({ message: "User login failed" });
        return;
      }
    }
  };

  public logout: RequestHandler = async (req: Request, res: Response) => {
    try {
      const walletAddress = req.cookies.walletAddress;
      const accessToken = req.cookies.accessToken as string;

      if (!accessToken) {
        res.status(400).json({ message: "No access token provided" });
        return;
      }
      if (!walletAddress) {
        res.status(400).json({ message: "Wallet address is required" });
        return;
      }

      res.clearCookie("accessToken", { httpOnly: true, sameSite: "strict" });
      res.clearCookie("walletAddress", { httpOnly: true, sameSite: "strict" });

      const deletedRefreshToken = await deleteRefreshToken(walletAddress);
      if (deletedRefreshToken === 1) {
        console.log("Refresh token deleted from Redis");
      } else {
        console.log("No refresh token found for walletAddress:", walletAddress);
      }

      res.status(200).json({ message: "User logged out successfully" });
      return;
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error logging out user:", error.message);
        res
          .status(500)
          .json({ message: "User logout failed", error: error.message });
        return;
      }
    }
  };
}

const authController = new AuthController();
export default authController;
