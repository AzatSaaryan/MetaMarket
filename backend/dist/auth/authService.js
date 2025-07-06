import userRepository from "../users/userRepository.js";
import authRepository from "./authRepository.js";
import { createNonce } from "../utils/authUtils.js";
import { verifyEthereumSignature } from "../utils/authUtils.js";
import { signAccessToken, signRefreshToken } from "../utils/authUtils.js";
class AuthService {
    async generateNonce(walletAddress) {
        try {
            const nonce = createNonce();
            const user = await userRepository.getUserByWalletAddress(walletAddress);
            if (user) {
                await authRepository.updateUserNonce(walletAddress, nonce);
            }
            else {
                await userRepository.createUser(walletAddress, nonce);
            }
            return nonce;
        }
        catch (error) {
            console.error("Error generating nonce:", error);
            throw new Error("Failed to generate nonce");
        }
    }
    async login(walletAddress, signature) {
        try {
            const user = await userRepository.getUserByWalletAddress(walletAddress);
            if (!user) {
                throw new Error("User not found");
            }
            const isValidSignature = verifyEthereumSignature(walletAddress, signature, user.nonce);
            if (!isValidSignature) {
                throw new Error("Invalid signature");
            }
            const newNonce = createNonce();
            await authRepository.updateUserNonce(walletAddress, newNonce);
            const accessToken = await signAccessToken(walletAddress);
            await signRefreshToken(walletAddress);
            return {
                accessToken,
                user: {
                    walletAddress,
                },
            };
        }
        catch (error) {
            console.error("Error logging in user:", error);
            throw new Error("User login failed");
        }
    }
}
const authService = new AuthService();
export default authService;
