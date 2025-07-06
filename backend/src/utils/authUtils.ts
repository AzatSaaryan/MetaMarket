import crypto from "crypto";
import { ethers, Wallet } from "ethers";
import jwt from "jsonwebtoken";
import redisClient from "../db/redis-store.js";
import userRepository from "../users/userRepository.js";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;

export const createNonce = (): string => {
  return crypto.randomBytes(16).toString("hex");
};

export const verifyEthereumSignature = (
  walletAddress: string,
  signature: string,
  nonce: string
): boolean => {
  try {
    const message = `Sign this message to log in. Nonce: ${nonce}`;
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === walletAddress.toLowerCase();
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
};

export const signAccessToken = async (
  walletAddress: string
): Promise<string> => {
  const user = await userRepository.getUserByWalletAddress(walletAddress);
  return jwt.sign({ user }, ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
};

export const signRefreshToken = async (
  walletAddress: string
): Promise<void> => {
  const user = await userRepository.getUserByWalletAddress(walletAddress);
  const refreshToken = jwt.sign({ user }, REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });

  await redisClient.set(walletAddress, refreshToken, { EX: 60 * 60 * 24 * 7 });
};

export const deleteRefreshToken = async (
  walletAddress: string
): Promise<number> => {
  try {
    return await redisClient.del(walletAddress);
  } catch (error) {
    throw new Error("Error while deleting token from Redis");
  }
};

export async function getStoredRefreshToken(
  walletAddress: string
): Promise<string | null> {
  try {
    const storedRefreshToken = await redisClient.get(walletAddress);
    return storedRefreshToken;
  } catch (error) {
    throw new Error("Error getting refresh token from Redis");
  }
}

// export async function verifyRefreshToken(
//   token: string
// ): Promise<string | null> {
//   try {
//     const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET) as {
//       walletAddress: string;
//     };

//     const storedToken = await redisClient.get(decoded.walletAddress);
//     if (storedToken !== token) return null; // токен был отозван

//     return decoded.walletAddress;
//   } catch {
//     return null;
//   }
// }
