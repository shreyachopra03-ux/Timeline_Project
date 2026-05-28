import express from "express";
import { uploadPhoto } from "../controllers/photoController.js";
import { upload } from "../middleware/multer.js"; 
import { clerkAuthGuard } from "../middleware/clerkAuthGuard.js";
const photoRouter = express.Router();

photoRouter.post("/upload", upload.single("photo"), clerkAuthGuard, uploadPhoto as any);

export default photoRouter;