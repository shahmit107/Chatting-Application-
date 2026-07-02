// THIS ONLY CHECKS WHETHER THE FILE CAN BE UPLOADED OR NOT 

// allowed file types
// max file size
// custom filename

import multer from "multer";

const storage = multer.memoryStorage();

const allowedImageMimeTypes = ["image/jpeg", "image/png", "image/webp"];
const allowedVideoMimeTypes = ["video/mp4", "video/webm", "video/ogg"];
const allowedDocMimeTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
const allowedAudioMimeTypes = [ "audio/mpeg", "audio/wav", "audio/ogg", "audio/webm"];

const imageFilter = (req, file, cb) => {
  if (!allowedImageMimeTypes.includes(file.mimetype)) {
    return cb(new Error("Only JPG, PNG, and WEBP images are allowed"), false);
  }
  cb(null, true);
};

const videoFilter = (req, file, cb) => {
  if (!allowedImageMimeTypes.includes(file.mimetype)) {
    return cb(new Error("Only mp4, webm, and ogg videos are allowed"), false);
  }
  cb(null, true);
};

const documentFilter = (req, file, cb) => {
  if (!allowedImageMimeTypes.includes(file.mimetype)) {
    return cb(new Error("Only pdf, msword, and document docs are allowed"), false);
  }
  cb(null, true);
};

const audioFilter = (req, file, cb) => {
  if (!allowedImageMimeTypes.includes(file.mimetype)) {
    return cb(new Error("Only mp3, wav, webm and ogg audio are allowed"), false);
  }
  cb(null, true);
};

export const uploadImage = multer({
  storage,
  imageFilter,
  limits: { fileSize: 5 * 1024 * 1024,} // 5MB 
});

export const uploadVideo = multer({
  storage,
  videoFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // Limits files to 50MB max
});

export const uploadDocument = multer({
  storage,
  documentFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // Limits files to 10MB max
});

export const uploadAudio = multer({
  storage,
  audioFilter,
  limits: { fileSize: 15 * 1024 * 1024 } // Limits files to 15MB max
});

// this is then imported in the routes
//This stores the image temporarily in memory, not in your backend folder.