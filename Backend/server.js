import "dotenv/config";
import crypto from "crypto"; if (!globalThis.crypto) { globalThis.crypto = crypto; }
import { WebSocketServer } from "ws";
import { connectDb } from "./src/db/db.js";
import { registerSocketApp } from "./src/app.js";
import config from "./src/config/config.js";

try {
  const wss = new WebSocketServer({ port: config.PORT}, () => {
    console.log("WEB SOCKET CONNECTED TO 8080");
  });
  registerSocketApp(wss);
} catch (err) {
  console.log("SERVER ERROR: " + err);
}

connectDb();