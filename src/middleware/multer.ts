import multer from "multer";

const storage = multer.memoryStorage();

export const upload = ({
    storage,
    limit: { fileSize: 50 * 1024 * 1024 }
});