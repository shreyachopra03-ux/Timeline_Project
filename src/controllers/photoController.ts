import cloudinary from "../config/cloudinary";
import { Request, Response } from "express";
import Photos from "../models/photos";

interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
    };
}

export const uploadPhoto = async (req: AuthenticatedRequest, res: Response): Promise<any> => {

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
            clerkId: (req as any).auth?.userId,
            url: cloudinaryResult.url,
            public_id: cloudinaryResult.public_id,
            date: new Date(),
            title: title || "untitled",
            tags: tagsArray
        });

        return res.status(200).json({ success: true, message: "Photo successfully uploaded and saved !", data: newPhoto });

    } catch (err) {
        console.error("Upload error details:", err);
        return res.status(500).json({ success: false, message: "Server error: Photo upload failed." });
    };
};

export const uploadBulkPhotos = async (req: Request, res: Response) => {

    try {

        const files = req.files as Express.Multer.File[];
        // console.log(files);
        if(!files || files.length === 0) {
            return res.status(400).json({ success: false, message: "Image files not found!"})
        }

        const { title, tags } = req.body;
        const tagsArray = tags && typeof tags === 'string' ? tags.split(',').map((tag: string) => tag.trim()) : [];
        // console.log(tagsArray);

        const uploadPromises = files.map((file: any, index: number) => {
            // console.log(`Processing file index: ${index}, name: ${file.originalname}`);
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: 'bulk_photos' },
                    (error, result) => {
                        if(error) {
                            // console.error(`Cloudinary error for file ${index}:`, error);
                            return reject(error);
                        }
                        // console.log(`cloudinary success for file ${index}`);
                        resolve(result);
                    }
                );
                stream.end(file.buffer);
            });
        });
        // console.log("Array of pending promises created: ", uploadPromises);

        const cloudinaryResults = await Promise.all(uploadPromises);

        const photosData = cloudinaryResults.map((result: any) => ({
            clerkId: "user_3E8C_BfNriZbIh",
            url: result.secure_url,
            public_id: result.public_id,
            date: new Date(),
            title: title || "Untitled Bulk Upload",
            tags: tagsArray
        }));
        // console.log(photosData);

        // For uploading all the bulk photos on DB
        const newPhotos = await Photos.insertMany(photosData);
        // console.log("Photos successfully uploaded on DB!");

        return res.status(201).json(
            { 
            success: true,
            message: `${photosData.length} photos uploaded successfully!`,
            data: photosData
            });

    } catch (err: any) {
        // console.error("Error:", err);
        return res.status(400).json({ success: false, message: "Bulk upload failed!"})
    }
};

export const getUserTimeline = async (req: Request, res: Response) => {

    try {
        const clerkId = "user_3E8C_BfNriZbIh";
    
        const photos = await Photos.find({ clerkId }).sort({ date: -1 });
        // console.log("Fetched photos count:", photos.length);

        if(!photos || photos.length === 0) {
            return res.status(200).json({ message: "No photos found on your timeline yet", data: [] });
        }

        return res.status(200).json({ success: true, message: "Here, is your timeline !", count: photos.length, data: photos})
    
    } catch (err: any) {
        // console.error("Error fetching timeline:", err.message);
        return res.status(400).json({ success: false, message: "Error: ", err });
    }
};

// export const getUserTimelineDateWise = async (req: Request, res: Response) => {

//     try {

//     } catch (err: any) {
//         console.error(err.message);
//         return res.status().json({ success: false, message: "", error: err.message });
//     }
// };

export const editUserPhoto = async(req: Request, res:Response ) => {

    try {
        const { id } = req.params;

        const { title, tags, url, public_id } = req.body;

        if(url || public_id) {
            return res.status(400).json({ success: false, message: "You can't change photo's url or it's public id!" });
        }

        const updatedPhoto = await Photos.findByIdAndUpdate(
            id,
            { title, tags },
            { new: true, runValidators: true }
        );

        if(!updatedPhoto) {
            return res.status(400).json({ success: false, message: "No photo found with this ID!" });
        }

        return res.status(200).json({ success: true, message: "Photo updated successfully!", data: updatedPhoto });
    } 
    catch (err: any) {
        console.error(err);
        return res.status(400).json({ success: false, error: err.message });
    } 
};

export const deletePhoto = async(req: Request, res:Response) => {

    try {
        const { id } = req.params;

        const deletedPhoto = await Photos.findByIdAndDelete(id);

        if(!deletedPhoto) {
            return res.status(404).json({ success: false, message: "No photo with this ID found!" });
        }

        return res.status(200).json({ success: true, message: "Photo deleted successfully!", data: deletePhoto });

    } catch (err: any) {
        console.error(err);
        return res.status(400).json({ success: false, error: err.message });
    }
};

export const deleteBulkPhotos = async(req: Request, res: Response) => {
    
    try {
        const { ids } = req.body;
      
        if(!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ success: false, message: "Please provide a valid array of photo ID's" });
        }

        const result = await Photos.deleteMany({ _id: { $in: ids } });

        const deleteCount = result.deletedCount;
        if(deleteCount === 0) {
            return res.status(404).json({ success: false, message: "None of the provided ID's were found in the DB" });
        }

        return res.status(200).json({ success: true, message: `Successfully deleted ${deleteCount} photos` });

    } catch (err: any) {
        console.error(err.message);
        return res.status(500).json({ success: false, message: "Something went wrong on the server" , error: err.message});
    }
};