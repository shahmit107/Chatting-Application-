import { join } from "./handlers/handlers.join.js";
import { chat } from "./handlers/handlers.chat.js";
import broadcaster from "./utils/utils.broadcastToRoom.js";
import getOnlineUsers from "./utils/utils.online_users.js";
import sendError from "./utils/utils.sendError.js";
import switchRoom from "./handlers/handlers.switchRoom.js";
import disconnect from "./handlers/handlers.disconnect.js";
import authRouter from "./routes/auth.routes.js";

const users = new Map();

export function registerSocketApp(wss) {
  wss.on("connection", (ws) => {
    ws.on("error", console.error);

    ws.on("message", async (rawMessage) => {
      let message = "";
      try {
        message = JSON.parse(rawMessage.toString());
      } catch (err) {
        sendError(ws, err, "Invalid JSON format");
        return;
      }

      try {
        if (message.type === "join") {
         await join(message, ws, users);
        }
      } catch (err) {
        sendError(ws, err, "JOINING ERROR");
        return;
      }

      try {
        if (message.type === "chat") {
          await chat(message, ws, users);
        }
      } catch (err) {
        sendError(ws, err, "CHATTING ERROR");
        return;
      }

      try {
        if (message.type === "switch_Room") {
          await switchRoom(message, ws, users)
        }
      } catch (err) {
        sendError(ws, err, "SWITCHING ERROR");
        return;
      }
    });

    ws.on("close", () => {
      disconnect(ws, users);
      });
  });
}