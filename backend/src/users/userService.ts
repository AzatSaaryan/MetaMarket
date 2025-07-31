import userRepository from "./userRepository.js";
import { IUser, IUserUpdate } from "./userModel.js";

class UserService {
  async updateUser(
    userId: string,
    updateUserData: IUserUpdate
  ): Promise<IUser | null> {
    if (updateUserData.email) {
      const existingUser = await userRepository.getUserByEmail(
        updateUserData.email
      );
      if (existingUser && existingUser._id?.toString() !== userId)
        throw new Error("Email already in use by another user");
    }

    if (updateUserData.username) {
      const existingUser = await userRepository.getUserByUsername(
        updateUserData.username
      );
      if (existingUser && existingUser._id?.toString() !== userId)
        throw new Error("Username already in use by another user");
    }

    const updatedUser: IUser | null = await userRepository.updateUser(
      userId,
      updateUserData
    );
    return updatedUser;
  }
}
const userService = new UserService();
export default userService;
