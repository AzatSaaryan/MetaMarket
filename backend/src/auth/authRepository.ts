import User from "../users/userModel.js";

class AuthRepository {
  async updateUserNonce(walletAddress: string, nonce: string): Promise<void> {
    await User.findOneAndUpdate(
      {
        walletAddress: walletAddress,
      },
      { $set: { nonce } },
      { new: true }
    );
  }
}
const authRepository = new AuthRepository();
export default authRepository;
