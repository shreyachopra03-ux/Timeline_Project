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
        const tagsArray = tags ? tags.split(',').map((tag: string) => tag.trim()) : [];

        const newPhoto = await Media.create({
            clerkId: req.user.id, 
            url: cloudinaryResult.secure_url, 
            public_id: cloudinaryResult.public_id,
            date: new Date(),
            title: title || "untitled",
            tags: tagsArray
        });

        return res.status(200).json({ success: true, message: "Media successfully uploaded! 🚀", data: newPhoto });

    } catch (err: any) {
        console.error("Upload error details:", err.message);
        return res.status(500).json({ success: false, message: "Server error: Media upload failed." });
    }
};

export const uploadBulkMedia = async (req: Request, res: Response) => {

    try {
        const files = req.files as Express.Multer.File[];
        
        if (!files || files.length === 0) {
            return res.status(400).json({ success: false, message: "Media files not found!" });
        }

        const { title, tags } = req.body;
        const tagsArray = tags && typeof tags === 'string' ? tags.split(',').map((tag: string) => tag.trim()) : [];

        const uploadPromises = files.map((file: any, index: number) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { 
                        folder: 'bulk_media',
                        resource_type: 'auto' 
                    },
                    (error, result) => {
                        if (error) return reject(error);
                        resolve(result);
                    }
                );
                stream.end(file.buffer);
            });
        });

        const cloudinaryResults = await Promise.all(uploadPromises);

        const mediaData = cloudinaryResults.map((result: any) => ({
            clerkId: (req as any).user?.id || "unknown_user", 
            url: result.secure_url, 
            public_id: result.public_id,
            date: new Date(),
            title: title || "Untitled Bulk Upload",
            tags: tagsArray
        }));

        const newMedia = await Media.insertMany(mediaData);

        return res.status(201).json({ success: true, message: `${newMedia.length} items uploaded successfully!`, data: newMedia});

    } catch (err: any) {
        // console.error("Bulk upload error:", err.message);
        return res.status(500).json({ success: false, message: "Bulk upload failed on server!", error: err.message });
    }
};

export const getUserTimeline = async (req: Request, res: Response) => {

    try {
        const clerkId = (req as any).user?.id; 

        if (!clerkId) {
            return res.status(401).json({ success: false, message: "Unauthorized! User ID missing." });
        }

        const media = await Media.find({ clerkId }).sort({ date: -1 });

        if (media.length === 0) {
            return res.status(200).json({ success: true, message: "No media found on your timeline yet!", count: 0,data: [] });
        }

        return res.status(200).json({ success: true, message: "Timeline fetched successfully!", count: media.length, data: media});
    
    } catch (err: any) {
        // console.error("Error fetching timeline:", err.message);
        return res.status(500).json({ success: false, message: "Failed to fetch timeline due to server error.", error: err.message });
    }
};

export const getUserTimelineDateWise = async (req: Request, res: Response) => {

    try {

        const clerkId = (req as any).user?.id; 

        if (!clerkId) {
            return res.status(401).json({ success: false, message: "Unauthorized! User ID missing." });
        }

        const timelineData = await Media.aggregate([

            { $match: { clerkId: clerkId } },

            { $sort: { date: -1 } },

            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    count: { $sum: 1 },       
                    posts: { $push: "$$ROOT" }  
                }
            },

            { $sort: { "_id": -1 } },

            {
                $project: {
                    _id: 0,
                    date: "$_id",
                    count: 1,
                    posts: 1
                }
            }
        ]);

        if (timelineData.length === 0) {
            return res.status(200).json({ success: true, message: "Your timeline is empty!", data: [] });
        }

        return res.status(200).json({ success: true, message: "Date-wise timeline fetched successfully!", totalGroups: timelineData.length, data: timelineData });

    } catch (err: any) {
        // console.error("Error in getUserTimelineDateWise:", err.message);
        return res.status(500).json({ success: false, message: "Failed to fetch date-wise timeline due to server error.", error: err.message });
    }
};

export const editUserMedia = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, tags, url, public_id } = req.body;

        if (url || public_id) {
            return res.status(400).json({ success: false, message: "You can't change the media's URL or its public ID!" });
        }

        const updatedMedia = await Media.findByIdAndUpdate(
            id,
            { title, tags },
            { new: true, runValidators: true }
        );

        if (!updatedMedia) {
            return res.status(404).json({ success: false, message: "No media found with this ID!" });
        }

        return res.status(200).json({ success: true, message: "Media updated successfully!", data: updatedMedia });
    } 
    catch (err: any) {
        console.error("Error in editUserMedia:", err.message);
        return res.status(500).json({ success: false, error: err.message });
    } 
};

export const deleteMedia = async (req: Request, res: Response) => {

    try {
        const { id } = req.params;

        const deletedMedia = await Media.findByIdAndDelete(id);

        if (!deletedMedia) {
            return res.status(404).json({ success: false, message: "No media found with this ID!" });
        }

        const isVideo = deletedMedia?.url?.includes("/video/upload/") || false;
        
        await cloudinary.uploader.destroy(deletedMedia.public_id!, {
                resource_type: isVideo ? "video" : "image"
        });

        return res.status(200).json({ success: true, message: "Media deleted successfully from DB and Cloud!", data: deletedMedia });

    } catch (err: any) {
        console.error("Error in deleteMedia:", err.message);
        return res.status(500).json({ success: false, error: err.message });
    }
};

export const deleteBulkMedia = async (req: Request, res: Response) => {
    try {
        const { ids } = req.body;
      
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ success: false, message: "Please provide a valid array of media IDs!" });
        }

        const mediaToDelete = await Media.find({ _id: { $in: ids } });

        if (mediaToDelete.length === 0) {
            return res.status(404).json({ success: false, message: "None of the provided IDs were found in the DB!" });
        }

        const imagePublicIds: string[] = [];
        const videoPublicIds: string[] = [];

        mediaToDelete.forEach((item) => {
            if (item.public_id) {
                const isVideo = item.url?.includes("/video/upload/") || false;
                if (isVideo) {
                    videoPublicIds.push(item.public_id);
                } else {
                    imagePublicIds.push(item.public_id);
                }
            }
        });

        const cloudinaryPromises = [];
        
        if (imagePublicIds.length > 0) {
            cloudinaryPromises.push(
                cloudinary.api.delete_resources(imagePublicIds, { resource_type: "image" })
            );
        }
        if (videoPublicIds.length > 0) {
            cloudinaryPromises.push(
                cloudinary.api.delete_resources(videoPublicIds, { resource_type: "video" })
            );
        }

        if (cloudinaryPromises.length > 0) {
            await Promise.all(cloudinaryPromises);
        }

        const result = await Media.deleteMany({ _id: { $in: ids } });
        const deleteCount = result.deletedCount;

        return res.status(200).json({ success: true, message: `Successfully deleted ${deleteCount} media items from DB and Cloud!` });

    } catch (err: any) {
        console.error("Bulk delete error:", err.message);
        return res.status(500).json({ success: false, message: "Something went wrong on the server", error: err.message });
    }
};