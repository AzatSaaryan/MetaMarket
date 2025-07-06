import User from "../users/userModel.js";

class AuthRepository {
  async updateUserNonce(walletAddress: string, nonce: string): Promise<void> {
    try {
      await User.findOneAndUpdate(
        {
          walletAddress: walletAddress,
        },
        { $set: { nonce } },
        { new: true }
      );
    } catch (error) {
      console.error("Error updating user nonce:", error);
      throw new Error("Failed to update user nonce");
    }
  }

  
}
const authRepository = new AuthRepository();
export default authRepository;
