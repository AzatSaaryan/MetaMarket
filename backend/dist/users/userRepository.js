import User from "./userModel.js";
class UserRepository {
    async createUser(walletAddress, nonce) {
        try {
            await User.create({ walletAddress, nonce });
        }
        catch (error) {
            console.error("Error creating user:", error);
            throw new Error("Failed to create user");
        }
    }
    async updateUser(userId, userData) {
        try {
            const updatedUser = await User.findByIdAndUpdate(userId, { $set: userData }, { new: true }).exec();
            return updatedUser;
        }
        catch (error) {
            console.error("Error updating user:", error);
            throw new Error("Failed to update user");
        }
    }
    async getUserByEmail(email) {
        try {
            return await User.findOne({ email }).exec();
        }
        catch (error) {
            console.error("Error fetching user by email:", error);
            throw new Error("Failed to fetch user by email");
        }
    }
    async getUserByUsername(username) {
        try {
            return await User.findOne({ username }).exec();
        }
        catch (error) {
            console.error("Error fetching user by username:", error);
            throw new Error("Failed to fetch user by username");
        }
    }
    async getUserById(userId) {
        try {
            return await User.findById(userId).exec();
        }
        catch (error) {
            console.error("Error fetching user by ID:", error);
            throw new Error("Failed to fetch user by ID");
        }
    }
    async getUserByWalletAddress(walletAddress) {
        try {
            return await User.findOne({ walletAddress }).exec();
        }
        catch (error) {
            console.error("Error fetching user by wallet address:", error);
            throw new Error("Failed to fetch user by wallet address");
        }
    }
}
const userRepository = new UserRepository();
export default userRepository;
