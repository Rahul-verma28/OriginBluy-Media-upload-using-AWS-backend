import { Router } from "express";
import { protect } from "../middlewares/AuthMiddleware.js";
import { upload } from "../middlewares/uploadMiddleware.js";
import { deleteMedia, getMedia, searchMedia, uploadMedia } from "../controllers/mediaController.js";


const mediaRoutes = Router();

mediaRoutes.post("/upload", protect, upload.single("file"), uploadMedia);
mediaRoutes.get("/:userId", protect, getMedia);
mediaRoutes.delete("/:mediaId", protect, deleteMedia);
mediaRoutes.get("/search" , protect, searchMedia); // Search & filter media


export default mediaRoutes;