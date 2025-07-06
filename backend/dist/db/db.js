import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const MONGODB_URI = process.env.MONGODB_URI;
export default async function connectToDatabase() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("MongoDB connected successfully");
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("MongoDB connection error:", error.message);
            process.exit(1);
        }
    }
}
