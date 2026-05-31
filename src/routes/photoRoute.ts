import express from "express";
import { upload } from "../middleware/multer";
import { clerkAuthGuard } from "../middleware/clerkAuthGuard";
import { uploadPhoto, uploadBulkPhotos, getUserTimeline, editUserPhoto } from "../controllers/photoController";
const photoRouter = express.Router();

// Single photo upload
photoRouter.post("/upload", upload.single("photo"), uploadPhoto as any);

// Bulk photo upload
photoRouter.post("/upload-bulk", upload.array("photos"), uploadBulkPhotos as any);

// Get user's timeline
photoRouter.get("/timeline", getUserTimeline as any);

// Edit a particular photo
photoRouter.put("/:id", editUserPhoto as any)

export default photoRouter;