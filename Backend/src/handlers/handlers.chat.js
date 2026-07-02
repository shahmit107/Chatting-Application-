import broadcaster from "../utils/utils.broadcastToRoom.js";
import messageModel from "../model/model.message.js";
import sendError from "../utils/utils.sendError.js";

// validate chat message
// save message in MongoDB
// broadcast chat message

export async function chat(message, ws, users) {
  if (!ws.roomId || !ws.userName) {
    let err = "";
    sendError(ws, err, "Join a room before sending messages");
    return;
  }

  const d = new Date();
  const indianTime = d.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  let savedMessage;
  const allowedMediaTypes = ["image", "video", "document", "audio"];

  if (!message.payload?.messageType?.trim() || message.payload?.messageType === "text") {
    const chatMessage = message.payload?.message;
    if (!chatMessage?.trim()) {
      let err = "";
      sendError(ws, err, "Message can't be empty");
      return;
    } // in js empty strings are falsy

    savedMessage = await messageModel.create({
      roomId: ws.roomId,
      userName: ws.userName,
      message: chatMessage,
      messageType: "text", // Send along the sender's username!
      time: indianTime,
    });
  } else if (allowedMediaTypes.includes(message.payload?.messageType)) {
    if (!message.payload?.mediaUrl) {
      sendError(ws, "", "Image URL is required");
      return;
    }
    savedMessage = await messageModel.create({
      roomId: ws.roomId,
      userName: ws.userName, // Send along the sender's username!
      messageType: message.payload?.messageType,
      mediaUrl: message.payload?.mediaUrl,
      cloudinaryPublicId: message.payload?.cloudinaryPublicId,
      fileName: message.payload?.fileName,
      mimeType: message.payload?.mimeType,
      fileSize: message.payload?.fileSize, 
      time: indianTime,
    });
  } else {
    sendError(ws, "", "Invalid Message");
    return;
  }

  const outgoingMessage = {
    type: "chat",
    payload: {
      _id: savedMessage._id,
      roomId: savedMessage.roomId,
      userName: savedMessage.userName,
      messageType: savedMessage.messageType,

      message: savedMessage.message,

      mediaUrl: savedMessage.mediaUrl,
      cloudinaryPublicId: savedMessage.cloudinaryPublicId,
      fileName: savedMessage.fileName,
      mimeType: savedMessage.mimeType,
      fileSize: savedMessage.fileSize,

      time: savedMessage.time
    },
  };

  broadcaster(ws.roomId, outgoingMessage, users);
}
// chatMessage + " from " + ws.userName