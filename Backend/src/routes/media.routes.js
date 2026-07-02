import { Router } from "express";
import * as mediaController from "../controllers/media.controller.js";
import authMiddleware from "../MIddlewares/auth.middleware.js";
import {uploadImage, uploadVideo, uploadDocument, uploadAudio} from "../MIddlewares/upload.middleware.js";

const mediaRouter = Router();

// POST /api/media/upload/image → returns image URL
mediaRouter.post("/image", authMiddleware, uploadImage.single("image"), mediaController.uploadImage)

// // POST /api/media/upload/video → returns video URL
mediaRouter.post("/video", uploadVideo.single("video"), mediaController.uploadVideo)

// POST /api/media/upload/audio → returns audio URL
mediaRouter.post("/audio", uploadAudio.single("audio"), mediaController.uploadAudio)

// POST /api/media/upload/document → returns document URL
mediaRouter.post("/document", uploadDocument.single("file"), mediaController.uploadDocument)

export default mediaRouter;