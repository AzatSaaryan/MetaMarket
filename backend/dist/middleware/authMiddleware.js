import jwt from "jsonwebtoken";
import { getStoredRefreshToken } from "../utils/authUtils.js";
import { isAddress } from "ethers";
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
export const authMiddleware = async (req, res, next) => {
    if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
        console.error("Missing ACCESS_TOKEN_SECRET or REFRESH_TOKEN_SECRET");
        return res.status(500).json({ message: "Internal server error" });
    }
    const accessToken = req.cookies.accessToken;
    if (accessToken) {
        try {
            const decoded = jwt.verify(accessToken, ACCESS_TOKEN_SECRET);
            req.user = decoded;
            return next();
        }
        catch (err) {
            console.error("Access token verification failed:", err);
        }
    }
    const walletAddress = req.cookies.walletAddress;
    if (!walletAddress || !isAddress(walletAddress)) {
        console.error("Invalid or missing wallet address");
        return res
            .status(401)
            .json({ message: "Unauthorized: Invalid or missing wallet address" });
    }
    const storedRefreshToken = await getStoredRefreshToken(walletAddress);
    if (!storedRefreshToken) {
        console.error(`No refresh token found for wallet: ${walletAddress}`);
        return res
            .status(401)
            .json({ message: "Session expired. Please log in again." });
    }
    try {
        const decodedRefresh = jwt.verify(storedRefreshToken, REFRESH_TOKEN_SECRET);
        req.user = decodedRefresh;
        const newAccessToken = jwt.sign({ user: decodedRefresh.user }, ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
        res.cookie("accessToken", newAccessToken, {
            httpOnly: true,
            sameSite: "strict",
            maxAge: 15 * 60 * 1000,
        });
        return next();
    }
    catch (error) {
        console.error("Refresh token verification failed:", error);
        return res.status(401).json({ message: "Invalid refresh token" });
    }
};
