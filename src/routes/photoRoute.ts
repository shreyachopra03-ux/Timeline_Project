import express from "express";
import { uploadPhoto } from "../controllers/photoController";
import { upload } from "../middleware/multer";
import { clerkAuthGuard } from "../middleware/clerkAuthGuard";
const photoRouter = express.Router();

photoRouter.post("/upload", clerkAuthGuard, upload.single("photo"), uploadPhoto as any);

export default photoRouter;