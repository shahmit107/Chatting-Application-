import jwt from "jsonwebtoken";
import config from "../config/config.js";
import userModel from "../model/model.user.js";

export default async function verifyAccessToken(accessToken) {
  try {
    const decoded = jwt.verify(accessToken, config.ACCESS_TOKEN_SECRET);
    const user = await userModel.findById(decoded.userId).select("-password")
       return user
  } catch (err) {
    return null;
  }
}