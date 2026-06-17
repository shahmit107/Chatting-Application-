import userModel from "../model/model.user.js";
import config from "../config/config.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateAccessToken, generateRefreshToken } from "../utils/utils.generateTokens.js";
import cookieParser from "cookie-parser";

export async function register(req, res) {
  try {
    const { userName, phoneNumber, password } = req.body;

    if (!userName) {
      return res.status(400).send({
        type: "error",
        payload: {
          message: "UserName Name is required.",
        },
      });
    }

    if (!phoneNumber) {
      return res.status(400).send({
        type: "error",
        payload: {
          message: " Phone Number is required.",
        },
      });
    }

    if (!password) {
      return res.status(400).send({
        type: "error",
        payload: {
          message: "Password is required.",
        },
      });
    }

    const userExists = await userModel.findOne({ phoneNumber });

    if (userExists) {
      return res.status(409).send({
        type: "error",
        payload: {
          message: "User Already Exists.",
        },
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      parseInt(config.SALT_ROUNDS),
    );

    const user = await userModel.create({
      userName: userName,
      phoneNumber: phoneNumber,
      password: hashedPassword,
      joinedRooms: [],
      isPhoneVerified: false,
    });

    return res.status(201).send({
      type: "message",
      payload: {
        message: "User created successfully",
        user: {
          userName: user.userName,
          phoneNumber: user.phoneNumber,
          joinedRooms: [],
          isPhoneVerified: false,
        },
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(201).send({
      type: "error",
      payload: {
        error: "Internal Server Error",
      },
    });
  }
}

export async function loginUser(req, res) {
  const { phoneNumber, password } = req.body;

  if (!phoneNumber) {
    return res.status(400).send({
      type: "error",
      payload: {
        message: "Phone Number is required.",
      },
    });
  }

  if (!password) {
    return res.status(401).send({
      type: "error",
      payload: {
        message: "Password is required.",
      },
    });
  }

  const user = await userModel.findOne({ phoneNumber });

  if (!user) {
    return res.status(400).send({
      type: "error",
      payload: {
        message: "User not found",
      },
    });
  }

  const hashedPassword = user.password;

  const isPasswordCorrect = await bcrypt.compare(password, hashedPassword);

  if (isPasswordCorrect) {
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
  } else {
    return res.status(400).send({
      type: "error",
      payload: {
        message: "Password Doesn't match.",
      },
    });
  }
}

export async function refreshToken(req, res) {
  const { refreshToken } = req.cookies;
  //const refreshToken = refreshtoken;
  if (!refreshToken) {
    return res.status(401).send({
      type: "error",
      payload: {
        message: "Missing Refresh Token",
      },
    });
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, config.REFRESH_TOKEN_SECRET);
  } catch (err) {
    return res.status(401).send({
      type: "error",
      payload: { message: "Invalid or expired refresh token" },
    });
  }

  const user = await userModel.findById(decoded.userId);
  if (!user) {
    return res.status(401).send({
      type: "error",
      payload: {
        message: "User doesn't exists.",
      },
    });
  }

  const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
  if (!isValid) {
    return res.status(401).send({
      type: "error",
      payload: {
        message: "No such Refresh Token",
      },
    });
  }

  const newRefreshToken = generateRefreshToken(user);
  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
  });

  const refreshTokenHash = await bcrypt.hash(newRefreshToken, parseInt(config.SALT_ROUNDS));

  await userModel.findByIdAndUpdate(decoded.userId, {
    refreshToken: refreshTokenHash,
  });
  const accessToken = generateAccessToken(user);
  return res.json({
    type: "message",
    payload: {
      accessToken: accessToken,
    },
  });
}

export async function logout(req, res) {
  const userId = req.userId;
  await userModel.findByIdAndUpdate(userId, {
    refreshToken: null
  })
  res.clearCookie("refreshToken")
  return res.status(200).send({
    type: "message",
    payload: {
      message: "Logged out successfully"
    }
  })
}

export async function getMe(req, res) {
  try {
    const user = await userModel.findById(req.userId);

    if (!user) {
      return res.status(404).send({
        type: "error",
        payload: {
          message: "User not found",
        },
      });
    }

    return res.status(200).send({
      type: "message",
      payload: {
        user: {
          userName: user.userName,
          phoneNumber: user.phoneNumber,
          joinedRooms: user.joinedRooms || [],
        },
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send({
      type: "error",
      payload: {
        message: "Internal Server Error"
      },
    });
  }
}