import express from "express";
import { upload } from "../middleware/multer";
import { clerkAuthGuard } from "../middleware/clerkAuthGuard";
import { uploadMedia, uploadBulkMedia, getUserTimeline, editUserMedia, deleteMedia, deleteBulkMedia } from "../controllers/mediaController";
const mediaRouter = express.Router();

mediaRouter.use(clerkAuthGuard as any);

// Single photo upload
mediaRouter.post("/upload", upload.single("media"), uploadMedia as any);

// Bulk photo upload
mediaRouter.post("/upload-bulk", upload.array("media"), uploadBulkMedia as any);

// Get user's timeline
mediaRouter.get("/timeline", getUserTimeline as any);

// Edit a particular photo
mediaRouter.patch("/:id", editUserMedia as any);

// Delete bulk photos
mediaRouter.delete("/bulk-delete", deleteBulkMedia as any);

// Delete a particular photo
mediaRouter.delete("/:id", deleteMedia as any);

export default mediaRouter;