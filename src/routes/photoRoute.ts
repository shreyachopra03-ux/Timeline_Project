import express from "express";
import { upload } from "../middleware/multer";
import { clerkAuthGuard } from "../middleware/clerkAuthGuard";
import { uploadPhoto, uploadBulkPhotos, getUserTimeline, editUserPhoto, deletePhoto } from "../controllers/photoController";
const photoRouter = express.Router();

// Single photo upload
photoRouter.post("/upload", upload.single("photo"), uploadPhoto as any);

// Bulk photo upload
photoRouter.post("/upload-bulk", upload.array("photos"), uploadBulkPhotos as any);

// Get user's timeline
photoRouter.get("/timeline", getUserTimeline as any);

// Edit a particular photo
photoRouter.patch("/:id", editUserPhoto as any);

// Delete a particular photo
photoRouter.delete("/:id", deletePhoto as any);

export default photoRouter;