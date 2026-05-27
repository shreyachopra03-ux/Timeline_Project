import cloudinary from "../config/cloudinary";
import { Request, Response } from "express";
import Photos from "../models/photos";

interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
    };
}

export const uploadPhoto = async (req: AuthenticatedRequest, res: Response) => {

    if (!req.user || !req.user.id) {
        return res.status(401).json({ success: false, message: "Unauthorized! User not found." });
    };

    

    try {
        if(!req.file) {
            return res.json(400).json({ success: false, message: "Photo file is required !" });
        }

        const uploadToCloudinary = (): Promise<any> => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: "user_photos",
                        resource_type: "image"
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                stream.end(req.file!.buffer);
            });
        };

        const cloudinaryResult = await uploadToCloudinary();

        const { title, tags } = req.body;

        const tagsArray = tags ? tags.split(',').map((tag: string) => tag.trim()) : [];

        const newPhoto = await Photos.create({
            clerkId: req.user.id,
            url: cloudinaryResult.url,
            public_id: cloudinaryResult.public_id,
            date: new Date(),
            title: title || "untitled",
            tags: tagsArray
        });



    } catch (err) {

    }

}