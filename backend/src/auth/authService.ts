import userRepository from "../users/userRepository.js";
import authRepository from "./authRepository.js";
import { createNonce } from "../utils/authUtils.js";
import { verifyEthereumSignature } from "../utils/authUtils.js";
import { signAccessToken, signRefreshToken } from "../utils/authUtils.js";

type LoginResponse = {
  accessToken: string;
  user: {
    walletAddress: string;
  };
};

class AuthService {
  async generateNonce(walletAddress: string): Promise<string> {
    const nonce = createNonce();
    const user = await userRepository.getUserByWalletAddress(walletAddress);

    if (user) await authRepository.updateUserNonce(walletAddress, nonce);
    else await userRepository.createUser(walletAddress, nonce);

    return nonce;
  }

  async login(
    walletAddress: string,
    signature: string
  ): Promise<LoginResponse> {
    const user = await userRepository.getUserByWalletAddress(walletAddress);
    if (!user) throw new Error("User not found");

    const isValidSignature = verifyEthereumSignature(
      walletAddress,
      signature,
      user.nonce
    );

    if (!isValidSignature) throw new Error("Invalid signature");

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
}

const authService = new AuthService();
export default authService;
