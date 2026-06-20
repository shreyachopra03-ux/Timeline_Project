import { Request, Response } from 'express';
import crypto from 'crypto';
import Shared from '../models/shared';
import Media from '../models/media';

const MOCK_CLERK_ID = '6a0dc1a501c893d45ac99b3e';

function getUserId(req: Request): string {
    return (req as any).user?.id || MOCK_CLERK_ID;
}

// POST /shared/create
export const createShared = async (req: Request, res: Response) => {
    try {
        const { title, description, mediaIds } = req.body;
        const ownerId = getUserId(req);

        if (!title || !title.trim()) {
            return res.status(400).json({ success: false, message: 'Title is required.' });
        }

        const inviteCode = crypto.randomBytes(6).toString('hex');

        const shared = await Shared.create({
            ownerId,
            title: title.trim(),
            description: description || '',
            mediaIds: mediaIds || [],
            members: [],
            inviteCode,
        });

        return res.status(201).json({ success: true, message: 'Shared album created!', data: shared });
    } catch (err: any) {
        return res.status(500).json({ success: false, error: err.message });
    }
};

// GET /shared
export const getUserShared = async (req: Request, res: Response) => {
    try {
        const userId = getUserId(req);

        const shared = await Shared.find({
            $or: [{ ownerId: userId }, { 'members.clerkId': userId }],
        })
            .populate('mediaIds', 'cloudinary_url type fileName')
            .sort({ updatedAt: -1 });

        return res.status(200).json({ success: true, count: shared.length, data: shared });
    } catch (err: any) {
        return res.status(500).json({ success: false, error: err.message });
    }
};

// GET /shared/:id
export const getSharedById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = getUserId(req);

        const shared = await Shared.findOne({ _id: id }).populate(
            'mediaIds',
            'cloudinary_url type fileName duration'
        );

        if (!shared) {
            return res.status(404).json({ success: false, message: 'Shared album not found.' });
        }

        if (shared.ownerId !== userId && !shared.members.some((m) => m.clerkId === userId)) {
            return res.status(403).json({ success: false, message: 'Access denied.' });
        }

        return res.status(200).json({ success: true, data: shared });
    } catch (err: any) {
        return res.status(500).json({ success: false, error: err.message });
    }
};

// POST /shared/:id/add-photo
export const addPhotoToShared = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { mediaId } = req.body;
        const userId = getUserId(req);

        if (!mediaId) {
            return res.status(400).json({ success: false, message: 'mediaId is required.' });
        }

        const shared = await Shared.findOne({ _id: id });

        if (!shared) {
            return res.status(404).json({ success: false, message: 'Shared album not found.' });
        }

        if (shared.ownerId !== userId) {
            return res.status(403).json({ success: false, message: 'Only the owner can add photos.' });
        }

        const media = await Media.findById(mediaId);
        if (!media) {
            return res.status(404).json({ success: false, message: 'Media not found.' });
        }

        if (shared.mediaIds.some((m) => m.toString() === mediaId)) {
            return res.status(400).json({ success: false, message: 'Media already in album.' });
        }

        shared.mediaIds.push(media._id);
        await shared.save();

        return res.status(200).json({ success: true, message: 'Photo added to album.', data: shared });
    } catch (err: any) {
        return res.status(500).json({ success: false, error: err.message });
    }
};

// DELETE /shared/:id/remove-photo/:photoId
export const removePhotoFromShared = async (req: Request, res: Response) => {
    try {
        const { id, photoId } = req.params;
        const userId = getUserId(req);

        const shared = await Shared.findOne({ _id: id });

        if (!shared) {
            return res.status(404).json({ success: false, message: 'Shared album not found.' });
        }

        if (shared.ownerId !== userId) {
            return res.status(403).json({ success: false, message: 'Only the owner can remove photos.' });
        }

        shared.mediaIds = shared.mediaIds.filter((m) => m.toString() !== photoId);
        await shared.save();

        return res.status(200).json({ success: true, message: 'Photo removed from album.', data: shared });
    } catch (err: any) {
        return res.status(500).json({ success: false, error: err.message });
    }
};

// POST /shared/:id/invite
export const inviteMember = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { clerkId, name, email } = req.body;
        const userId = getUserId(req);

        if (!clerkId) {
            return res.status(400).json({ success: false, message: 'clerkId of the user to invite is required.' });
        }

        const shared = await Shared.findOne({ _id: id });

        if (!shared) {
            return res.status(404).json({ success: false, message: 'Shared album not found.' });
        }

        if (shared.ownerId !== userId) {
            return res.status(403).json({ success: false, message: 'Only the owner can invite members.' });
        }

        if (shared.members.some((m) => m.clerkId === clerkId)) {
            return res.status(400).json({ success: false, message: 'User is already a member.' });
        }

        shared.members.push({ clerkId, name, email });
        await shared.save();

        return res.status(200).json({ success: true, message: 'Member invited successfully.', data: shared });
    } catch (err: any) {
        return res.status(500).json({ success: false, error: err.message });
    }
};

// DELETE /shared/:id/remove-member/:userId
export const removeMember = async (req: Request, res: Response) => {
    try {
        const { id, userId: memberId } = req.params;
        const userId = getUserId(req);

        const shared = await Shared.findOne({ _id: id });

        if (!shared) {
            return res.status(404).json({ success: false, message: 'Shared album not found.' });
        }

        if (shared.ownerId !== userId) {
            return res.status(403).json({ success: false, message: 'Only the owner can remove members.' });
        }

        shared.members = shared.members.filter((m) => m.clerkId !== memberId);
        await shared.save();

        return res.status(200).json({ success: true, message: 'Member removed.', data: shared });
    } catch (err: any) {
        return res.status(500).json({ success: false, error: err.message });
    }
};

// DELETE /shared/:id
export const deleteShared = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = getUserId(req);

        const shared = await Shared.findOne({ _id: id });

        if (!shared) {
            return res.status(404).json({ success: false, message: 'Shared album not found.' });
        }

        if (shared.ownerId !== userId) {
            return res.status(403).json({ success: false, message: 'Only the owner can delete the album.' });
        }

        await Shared.deleteOne({ _id: id });

        return res.status(200).json({ success: true, message: 'Shared album deleted.' });
    } catch (err: any) {
        return res.status(500).json({ success: false, error: err.message });
    }
};
