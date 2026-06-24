import cloudinary from "../config/cloudinary";
import { Request, Response } from "express";
import Media from "../models/media";

interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
    };
}

export const uploadMedia = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ success: false, message: "Unauthorized! User not found." });
    }

    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "Media file is required!" });
        }

        const uploadToCloudinary = (): Promise<any> => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { 
                        folder: "user_timeline_media", 
                        resource_type: "auto" 
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
        const tagsArray = tags && typeof tags === 'string' ? tags.split(',').map((tag: string) => tag.trim()) : [];

        const newPhoto = await Media.create({
            clerkId: req.user.id, 
            cloudinary_url: cloudinaryResult.secure_url,
            public_id: cloudinaryResult.public_id,
            type: cloudinaryResult.resource_type === 'video' ? 'video' : 'image',
            duration: cloudinaryResult.duration || 0,
            fileName: req.file.originalname,
            fileSize: req.file.size,
            date: new Date(),
            title: title || "untitled",
            tags: tagsArray
        });

        return res.status(200).json({ success: true, message: "Media successfully uploaded!", data: newPhoto });
    } catch (err: any) {
        return res.status(500).json({ success: false, message: "Server error: Media upload failed.", error: err.message });
    }
};

export const uploadBulkMedia = async (req: AuthenticatedRequest, res: Response) => {

    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized! User not found." });
        }

        const files = req.files as Express.Multer.File[];
        if (!files || files.length === 0) {
            return res.status(400).json({ success: false, message: "Media files not found!" });
        }

        const { title, tags } = req.body;
        const tagsArray = tags && typeof tags === 'string' ? tags.split(',').map((tag: string) => tag.trim()) : [];

        const uploadPromises = files.map((file: any) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: 'bulk_media', resource_type: 'auto' },
                    (error, result) => {
                        if (error) return reject(error);
                        resolve(result);
                    }
                );
                stream.end(file.buffer);
            });
        });

        const cloudinaryResults = await Promise.all(uploadPromises);

        const mediaData = cloudinaryResults.map((result: any, idx: number) => ({
            clerkId: userId, 
            cloudinary_url: result.secure_url,
            public_id: result.public_id,
            type: result.resource_type === 'video' ? 'video' : 'image',
            duration: result.duration || 0,
            fileName: files[idx]?.originalname,
            fileSize: files[idx]?.size,
            date: new Date(),
            title: title || "Untitled Bulk Upload",
            tags: tagsArray
        }));

        const newMedia = await Media.insertMany(mediaData);
        return res.status(201).json({ success: true, message: `${newMedia.length} items uploaded successfully!`, data: newMedia});
    } catch (err: any) {
        return res.status(500).json({ success: false, message: "Bulk upload failed on server!", error: err.message });
    }
};

export const getUserTimeline = async (req: AuthenticatedRequest, res: Response) => {

    try {
        const clerkId = req.user?.id;
        if (!clerkId) {
            return res.status(401).json({ success: false, message: "Unauthorized! User ID missing." });
        }

        const { from, to } = req.query;
        let queryFilters: any = { clerkId };

        if (from || to) {
            queryFilters.date = {};
            if (from) {
                queryFilters.date.$gte = new Date(`${from}T00:00:00.000Z`);
            }
            if (to) {
                queryFilters.date.$lte = new Date(`${to}T23:59:59.999Z`);
            }
        }

        const media = await Media.find(queryFilters).sort({ date: -1 });

        return res.status(200).json({ 
            success: true, 
            message: from || to ? "Filtered timeline fetched successfully!" : "Full timeline fetched successfully!", 
            count: media.length, 
            data: media
        });
    } catch (err: any) {
        return res.status(500).json({ success: false, message: "Failed to fetch timeline due to server error.", error: err.message });
    }
};

export const editUserMedia = async (req: AuthenticatedRequest, res: Response) => {

    try {
        const { id } = req.params;
        const { title, tags, url, public_id } = req.body;
        
        const clerkId = req.user?.id;

        if (url || public_id) {
            return res.status(400).json({ success: false, message: "You can't change the media's URL or its public ID!" });
        }

        const tagsArray = tags && typeof tags === 'string' ? tags.split(',').map((tag: string) => tag.trim()) : tags;

        const updatedMedia = await Media.findOneAndUpdate(
            { _id: id, clerkId },
            { title, tags: tagsArray },
            { returnDocument: 'after', runValidators: true } // 🔥 Warning Fixed here
        );

        if (!updatedMedia) {
            return res.status(404).json({ success: false, message: "No media found with this ID for this user!" });
        }

        return res.status(200).json({ success: true, message: "Media updated successfully!", data: updatedMedia });
    } catch (err: any) {
        return res.status(500).json({ success: false, error: err.message });
    } 
};

export const deleteMedia = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;
        const clerkId = req.user?.id;

        const deletedItem = await Media.findOneAndDelete({ _id: id, clerkId });
        if (!deletedItem) {
            return res.status(404).json({ success: false, message: "No media found with this ID!" });
        }
        return res.status(200).json({ success: true, message: "Media item deleted successfully!" });
    } catch (err: any) {
        return res.status(500).json({ success: false, error: err.message });
    }
};

export const deleteBulkMedia = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { ids } = req.body; 
        const clerkId = req.user?.id;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ success: false, message: "Please provide an array of media IDs to delete." });
        }

        const deleteResult = await Media.deleteMany({ _id: { $in: ids }, clerkId });
        return res.status(200).json({ success: true, message: `${deleteResult.deletedCount} items deleted successfully!` });
    } catch (err: any) {
        return res.status(500).json({ success: false, error: err.message });
    }
};