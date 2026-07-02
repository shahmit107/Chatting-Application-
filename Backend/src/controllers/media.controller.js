import cloudinary from "../config/cloudinary.js";

const uploadToCloudinary = (fileBuffer, folder, resource_type) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { 
        folder: folder, 
        resource_type: resource_type 
    },
      (error, result) => (error ? reject(error) : resolve(result))
    ).end(fileBuffer); 
    // Without this nothing gets sent to Cloudinary. 
    
    // You have to create the stream first before you can push data into it. Simple as that.

    // Because it relies on this callback style, you cannot chain a .then() directly to upload_stream.
  });
};

export async function uploadImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).send({
        type: "error",
        payload: {
          message: "Image file is required",
        },
      });
    }
    const folder = "chat-app/images" 
    const resource_type= "image" 

    const result = await uploadToCloudinary(req.file.buffer, folder, resource_type);

    return res.status(200).send({
      type: "success",
      payload: {
        message: "Image uploaded successfully",
        mediaUrl: result.secure_url,
        cloudinaryPublicId: result.public_id,
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
        messageType: "image",
      },
    });
  } catch (err) {
    return res.status(500).send({
      type: "error",
      payload: {
        message: "Image upload failed" + err,
      },
    });
  }
}

export async function uploadVideo(req, res) {
  try {
    if (!req.file) {
      return res.status(400).send({
        type: "error",
        payload: {
          message: "Video file is required",
        },
      });
    }

    const folder = "chat-app/videos" 
    const resource_type= "video" 

    const result = await uploadToCloudinary(req.file.buffer, folder, resource_type);

    return res.status(200).send({
      type: "success",
      payload: {
        message: "Video uploaded successfully",
        mediaUrl: result.secure_url,
        cloudinaryPublicId: result.public_id,
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
        messageType: "video",
      },
    });
  } catch (err) {
    return res.status(500).send({
      type: "error",
      payload: {
        message: "Video upload failed" + err,
      },
    });
  }
}

export async function uploadDocument(req, res) {
  try {
    if (!req.file) {
      return res.status(400).send({
        type: "error",
        payload: {
          message: "Document file is required",
        },
      });
    }

    const folder = "chat-app/documents" 
    const resource_type= "raw" 

    const result = await uploadToCloudinary(req.file.buffer, folder, resource_type);

    return res.status(200).send({
      type: "success",
      payload: {
        message: "Image uploaded successfully",
        mediaUrl: result.secure_url,
        cloudinaryPublicId: result.public_id,
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
        messageType: "document",
      },
    });
  } catch (err) {
    return res.status(500).send({
      type: "error",
      payload: {
        message: "Image upload failed" + err,
      },
    });
  }
}

export async function uploadAudio(req, res) {
  try {
    if (!req.file) {
      return res.status(400).send({
        type: "error",
        payload: {
          message: "Audio file is required",
        },
      });
    }

    const folder = "chat-app/audio" 
    const resource_type= "video" 

    const result = await uploadToCloudinary(req.file.buffer, folder, resource_type);

    return res.status(200).send({
      type: "success",
      payload: {
        message: "Audio uploaded successfully",
        mediaUrl: result.secure_url,
        cloudinaryPublicId: result.public_id,
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
        messageType: "audio",
      },
    });
  } catch (err) {
    return res.status(500).send({
      type: "error",
      payload: {
        message: "Audio upload failed" + err,
      },
    });
  }
}