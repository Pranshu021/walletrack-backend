import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectMongoDB = async() => {
    try {
        console.log("🌐 Connecting to DB...")
        await mongoose.connect(process.env.MONGO_URI || "");
        console.log("✅ Database Connected Successfully!");
    } catch(error) {
        console.error("❌ Database connection error: ",  error);
        process.exit(1);
    }
}