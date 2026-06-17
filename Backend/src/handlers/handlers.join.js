import broadcaster from "../utils/utils.broadcastToRoom.js";
import getOnlineUsers from "../utils/utils.online_users.js";
import userModel from "../model/model.user.js";
import sendError from "../utils/utils.sendError.js";
import getOldMessages from "../utils/utils.getMessagesHistory.js";

// validate username and room
// save persistent joined room in MongoDB
// add socket to active live room
// broadcast join message
// broadcast online users
// send joinedRooms list to that user

export async function join(message, ws, users) {

  const roomId = message.payload?.roomId;

  if (!roomId?.trim()) {
    let err = ""
    sendError(ws, err, "roomID and userName are required.")
    return;
  }

  if (users?.get(roomId)?.has(ws)) {
    let err = ""
    sendError(ws, err, "Already joined this room")
    return;
  }

  ws.roomId = roomId;

  if (!users.has(roomId)) {
    users.set(roomId, new Set());
  }
  users.get(roomId).add(ws);
  message = {
    type: "system",
    payload: {
      message: `${ws.userName} have joined`,
    },
  };

  const userRoom = await userModel.findOneAndUpdate(
    { _id: ws.userId }, // filter
    { $addToSet: { joinedRooms: ws.roomId } }, // insert the data
    {
      returnDocument: "after", //return the user document after the room has been added
      upsert: true,
    }, // some options
  );
  ws.send(
    JSON.stringify({
      type: "joined_rooms",
      payload: {
        message: userRoom.joinedRooms,
      },
    }),
  );
  broadcaster(roomId, message, users);

  const onlineUsers = getOnlineUsers(users, roomId);
  message = {
    type: "onlineUsers",
    payload: {
      message: onlineUsers,
    },
  };
  broadcaster(roomId, message, users);

  getOldMessages(ws, roomId)
}