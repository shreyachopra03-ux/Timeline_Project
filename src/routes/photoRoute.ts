import express from "express";
import { uploadPhoto } from "../controllers/photoController";
import { upload } from "../middleware/multer";
import { clerkAuthGuard } from "../middleware/clerkAuthGuard";
import { uploadBulkPhotos } from "../controllers/photoController";
const photoRouter = express.Router();

photoRouter.post("/upload", clerkAuthGuard, upload.single("photo"), uploadPhoto as any);

photoRouter.post("/upload-bulk", clerkAuthGuard, upload.array("photos"), uploadBulkPhotos as any);

export default photoRouter;