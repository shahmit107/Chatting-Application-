import "dotenv/config";
import mongoose from "mongoose";
import config from "../config/config.js";

export async function connectDb() {
  try {
    await mongoose.connect("config.MONGO_URI");
    console.log("DB CONNECTED");
  } catch (err) {
    console.log("DATABASE ERROR: " + err);
  }
}