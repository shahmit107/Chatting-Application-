import broadcaster from "../utils/utils.broadcastToRoom.js";
import getOnlineUsers from "../utils/utils.online_users.js";

// remove socket from current live room
// broadcast leave message
// broadcast updated online users
// delete empty live room from Map

export default function disconnect(ws, users) {
    const roomId = ws.roomId;

      if (!roomId) return; // If this socket was not assigned to any room, stop here
      const rooms = users.get(roomId); //   // Get the Set of users/sockets connected to this room

      if (rooms?.delete(ws)) {
        // Remove the current disconnected socket from the room
        let message = {
          type: "system",
          payload: {
            message: `${ws.userName} have left`,
          },
        };
        broadcaster(roomId, message, users);
        const onlineUsers = getOnlineUsers(users, roomId);
        message = {
          type: "onlineUsers",
          payload: {
            message: onlineUsers,
          },
        };
        broadcaster(roomId, message, users);
      }

      if (rooms?.size === 0) {
        // If the room exists and has no users left, remove the room from the Map
        users.delete(roomId);
      }
}