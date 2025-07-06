import userRepository from "./userRepository.js";
class UserService {
    async updateUser(userId, updateUserData) {
        try {
            if (updateUserData.email) {
                const existingUser = await userRepository.getUserByEmail(updateUserData.email);
                if (existingUser && existingUser._id?.toString() !== userId) {
                    throw new Error("Email already in use by another user");
                }
            }
            if (updateUserData.username) {
                const existingUser = await userRepository.getUserByUsername(updateUserData.username);
                if (existingUser && existingUser._id?.toString() !== userId) {
                    throw new Error("Username already in use by another user");
                }
            }
            const updatedUser = await userRepository.updateUser(userId, updateUserData);
            return updatedUser;
        }
        catch (error) {
            console.error("Error updating user in service:", error);
            throw new Error("Failed to update user in service");
        }
    }
}
const userService = new UserService();
export default userService;
