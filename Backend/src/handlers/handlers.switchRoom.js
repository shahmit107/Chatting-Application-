import getOnlineUsers from "../utils/utils.online_users.js";
import broadcaster  from "../utils/utils.broadcastToRoom.js";
import getOldMessages from "../utils/utils.getMessagesHistory.js";

// Read old room from ws.roomId
// Read new room from message payload
// Stop if both rooms are the same
// Remove socket from old room
// Update online users for old room
// Create new live room Set if required
// Add socket to new room
// Update ws.roomId
// Update online users for new room

export default async function switchRoom(message, ws, users) {

  const oldRoomId = ws.roomId;
  const newRoomId = message.payload.roomId;
  if (oldRoomId !== newRoomId) {
    users.get(oldRoomId)?.delete(ws); //remove the old id

    let oldRoomOnlineUsers = getOnlineUsers(users, oldRoomId);
    const oldRoomUsersMessage = {
      type: "onlineUsers",
      payload: {
        message: oldRoomOnlineUsers,
      },
    };

    broadcaster(oldRoomId, oldRoomUsersMessage, users);

    if (!users.has(newRoomId)) {
      users.set(newRoomId, new Set());
    }

    users.get(newRoomId)?.add(ws); // uploading new id to the socket
    const newRoomOnlineUsers = getOnlineUsers(users, newRoomId);
    const newRoomUsersMessage = {
      type: "onlineUsers",
      payload: {
        message: newRoomOnlineUsers,
      },
    };

    broadcaster(newRoomId, newRoomUsersMessage, users);
    ws.roomId = newRoomId; // setting the new id
    const roomId = newRoomId;

    await getOldMessages(ws, newRoomId)
  }
}