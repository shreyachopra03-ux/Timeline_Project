import express from "express";
const photoRouter = express.Router();
import { uploadPhoto }  from "../controllers/photoController";
import { upload } from "../middleware/multer";
import { requireAuth } from "@clerk/express";

photoRouter.post("/upload", requireAuth , upload, uploadPhoto);