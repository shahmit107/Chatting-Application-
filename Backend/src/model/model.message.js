import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    messageType: {
      type: String,
      enum: ["text", "image", "video", "document", "audio"],
      default: "text",
    },

    text: {
      type: String,
    },

    mediaUrl: {
      type: String,
    },

    cloudinaryPublicId: {
      type: String,
    },

    fileName: {
      type: String,
    },

    mimeType: {
      type: String,
    },

    fileSize: {
      type: Number,
    },

    roomId: {
      type: String,
    },

    userName: {
      type: String
    },
    
    message: {
      type: String
    }
  },
  {
    timestamps: true,
  },
);

const messageModel = mongoose.model("message", messageSchema);

export default messageModel;
