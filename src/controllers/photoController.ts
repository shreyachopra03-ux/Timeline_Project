import cloudinary from "../config/cloudinary";
import { Request, Response } from "express";
import Photos from "../models/photos";

export const uploadPhoto = async (req: Request, res: Response) => {

    try {
        if(!req.file) {
            return res.json(400).json({ success: false, message: "Photo fie is required !" });
        }

        const uploadToCloudinary = () => {
            return new Promise((resolve, reject) => {
                
            })
        }

    } catch (err) {

    }

}