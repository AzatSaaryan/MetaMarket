import User, { IUser, IUserUpdate } from "./userModel.js";

class UserRepository {
  async createUser(walletAddress: string, nonce: string): Promise<void> {
    await User.create({ walletAddress, nonce });
  }
  async updateUser(
    userId: string,
    userData: IUserUpdate
  ): Promise<IUser | null> {
    const updatedUser: IUser | null = await User.findByIdAndUpdate(
      userId,
      { $set: userData },
      { new: true }
    ).exec();
    return updatedUser;
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email }).exec();
  }

  async getUserByUsername(username: string): Promise<IUser | null> {
    return await User.findOne({ username }).exec();
  }
  async getUserById(userId: string): Promise<IUser | null> {
    return await User.findById(userId).exec();
  }

  async getUserByWalletAddress(walletAddress: string): Promise<IUser | null> {
    return await User.findOne({ walletAddress }).exec();
  }
}

const userRepository = new UserRepository();
export default userRepository;
