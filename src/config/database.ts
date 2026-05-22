import mongoose from "mongoose";
import type { Request, Response } from "express";

const connectDB = async (req: Request, res: Response) => {
    const server = mongoose.connect(process.env.MONGO_URI as string);
}

export default connectDB;