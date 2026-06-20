import "dotenv/config";
import mongoose from "mongoose";

export const connectDB = async () => {
    const server = mongoose.connect(process.env.MONGO_URI as string);
};

