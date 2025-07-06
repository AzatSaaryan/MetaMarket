import { Schema, Types, model } from "mongoose";
import { z } from "zod";
const userSchema = new Schema({
    _id: { type: Types.ObjectId, default: () => new Types.ObjectId() },
    walletAddress: { type: String, required: true, unique: true },
    nonce: { type: String, required: true },
    username: {
        type: String,
        unique: true,
        minlength: 3,
        maxlength: 20,
        sparse: true,
    },
    email: { type: String, required: false, unique: true, sparse: true },
}, { timestamps: true });
export const UserSchemaZod = z.object({
    _id: z.string().optional(),
    walletAddress: z.string().min(1),
    nonce: z.string().min(1, "Nonce is required"),
    username: z.string().min(3).max(20).optional(),
    email: z.string().email().optional(),
});
export const UserUpdateSchemaZod = UserSchemaZod.pick({
    email: true,
    username: true,
}).partial();
const User = model("User", userSchema);
export default User;
