import userModel from "../model/model.user.js";
import config from "../config/config.js";
import bcrypt from "bcryptjs";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/utils.generateTokens.js";
import cookieParser from "cookie-parser";

export async function completeLogin(user, res) {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  const refreshTokenHashed = await bcrypt.hash(
    refreshToken,
    parseInt(config.SALT_ROUNDS),
  );

  await userModel.findByIdAndUpdate(user._id, {
    refreshToken: refreshTokenHashed,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
  });

  return res.status(200).send({
    type: "message",
    payload: {
      message: "Logged In Successfully",
      accessToken: accessToken,
    },
  });
}