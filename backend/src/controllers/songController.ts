import cloudinary from "../config/cloudinary";
import { Request, Response } from "express";
import Song from "../models/song";

interface AuthenticatedRequest extends Request {
    user?: { id: string };
}

export const searchSongs = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { q } = req.query;
        const query: any = { clerkId: req.user?.id };
        if (q && typeof q === 'string' && q.trim()) {
            query.$or = [
                { title: { $regex: q.trim(), $options: 'i' } },
                { artist: { $regex: q.trim(), $options: 'i' } },
            ];
        }
        const songs = await Song.find(query).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, count: songs.length, data: songs });
    } catch (err: any) {
        console.error("Song search error:", err);
        return res.status(500).json({ success: false, error: err.message || "Search failed" });
    }
};

export const uploadSong = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    const clerkId = req.user?.id;

    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "Audio file is required!" });
        }

        const uploadToCloudinary = (): Promise<any> => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: "user_songs", resource_type: "auto" },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                stream.end(req.file!.buffer);
            });
        };

        const cloudinaryResult = await uploadToCloudinary();
        const { title, artist } = req.body;

        const newSong = await Song.create({
            clerkId,
            title: title || req.file.originalname || "Untitled Song",
            artist: artist || "",
            url: cloudinaryResult.secure_url,
            public_id: cloudinaryResult.public_id,
            duration: cloudinaryResult.duration || 0,
            fileSize: req.file.size
        });

        return res.status(200).json({ success: true, message: "Song uploaded successfully!", data: newSong });
    } 
    catch (err: any) {
        return res.status(500).json({ success: false, message: "Song upload failed.", error: err.message });
    }
};

export const getAllSongs = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const clerkId = req.user?.id;
        const songs = await Song.find({ clerkId }).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, count: songs.length, data: songs });
    } 
    catch (err: any) {
        return res.status(500).json({ success: false, error: err.message });
    }
};

export const deleteSong = async (req: AuthenticatedRequest, res: Response) => {

    try {
        const { id } = req.params;
        const clerkId = req.user?.id;
        const song = await Song.findOneAndDelete({ _id: id, clerkId });
        if (!song) {
            return res.status(404).json({ success: false, message: "Song not found!" });
        }
        await cloudinary.uploader.destroy(song.public_id, { resource_type: 'video' });
        return res.status(200).json({ success: true, message: "Song deleted successfully!" });
    } 
    catch (err: any) {
        return res.status(500).json({ success: false, error: err.message });
    }
};
