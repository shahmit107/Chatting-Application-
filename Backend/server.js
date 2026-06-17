import "dotenv/config";
import crypto from "crypto"; if (!globalThis.crypto) { globalThis.crypto = crypto; }
import { WebSocketServer } from "ws";
import { connectDb } from "./src/db/db.js";
import { registerSocketApp } from "./src/app.js";
import config from "./src/config/config.js";
import express from "express";
import cors from "cors";
import authRouter from "./src/routes/auth.routes.js";
import cookieParser from "cookie-parser";

try {
  const app = express();
  app.use(express.json());
  app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
  app.use(cookieParser())
  app.use("/api/auth/", authRouter)

  const server = app.listen(config.PORT, "0.0.0.0", ()=> {
    console.log("SERVER IS RUNNING ON 8080")
  })
  const wss = new WebSocketServer({server});
  registerSocketApp(wss);
  await connectDb();
} catch (err) {
  console.log("SERVER ERROR: " + err);
}