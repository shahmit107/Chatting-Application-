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

  //const targetedRooms = users.get(ws.roomId);
  const chatMessage = message.payload?.message;

  if (!chatMessage?.trim()) {
    let err = "";
    sendError(ws, err, "Message can't be empty");
    return;
  } // in js empty strings are falsy

  const d = new Date();
  const indianTime = d.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  message = {
    type: "chat",
    payload: {
      message: chatMessage,
      userName: ws.userName, // Send along the sender's username!
      time: indianTime,
    },
  };
  await messageModel.create({
    roomId: ws.roomId,
    userName: ws.userName,
    message: chatMessage,
  });
  broadcaster(ws.roomId, message, users);
}
// chatMessage + " from " + ws.userName