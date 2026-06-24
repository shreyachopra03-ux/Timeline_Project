import express from "express";
import { upload } from "../middleware/multer";
import { clerkAuthGuard } from "../middleware/clerkAuthGuard";
import { uploadSong, getAllSongs, deleteSong, searchSongs } from "../controllers/songController";

const songRouter = express.Router();

songRouter.use(clerkAuthGuard as any);

songRouter.get("/search", searchSongs as any);
songRouter.post("/upload", upload.single("audio"), uploadSong as any);
songRouter.get("/", getAllSongs as any);
songRouter.delete("/:id", deleteSong as any);

export default songRouter;
