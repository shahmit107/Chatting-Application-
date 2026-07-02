import userModel from "../model/model.user.js";
import config from "../config/config.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/utils.generateTokens.js";
import cookieParser from "cookie-parser";
import { sendEmail } from "../services/email.service.js";
import { otpGenerator, getOtpHtml } from "../utils/utils.otpGenerator.js";
import otpModel from "../model/model.otp.js";
import { completeLogin } from "../utils/utils.completeLogin.js";
export async function register(req, res) {
  try {
    const { userName, email, password } = req.body;

    if (!userName) {
      return res.status(400).send({
        type: "error",
        payload: {
          message: "UserName Name is required.",
        },
      });
    }

    if (!email) {
      return res.status(400).send({
        type: "error",
        payload: {
          message: " Email is required.",
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

    const userExists = await userModel.findOne({ email });

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
      email: email,
      password: hashedPassword,
      joinedRooms: [],
      isVerified: false,
    });

    return res.status(201).send({
      type: "message",
      payload: {
        message: "User created successfully",
        user: {
          userName: user.userName,
          email: user.email,
          joinedRooms: [],
          isVerified: false,
        },
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(201).send({
      type: "error",
      payload: {
        error: "Internal Server Error at register",
      },
    });
  }
}

export async function loginUser(req, res) {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).send({
      type: "error",
      payload: {
        message: "Email is required.",
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

  const user = await userModel.findOne({ email });

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
    user.isVerified = true;
    await user.save();
    return await completeLogin(user, res);
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

  const refreshTokenHash = await bcrypt.hash(
    newRefreshToken,
    parseInt(config.SALT_ROUNDS),
  );

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
    refreshToken: null,
  });
  res.clearCookie("refreshToken");
  return res.status(200).send({
    type: "message",
    payload: {
      message: "Logged out successfully",
    },
  });
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
          email: user.email,
          joinedRooms: user.joinedRooms || [],
        },
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send({
      type: "error",
      payload: {
        message: "Internal Server Error at get me ",
      },
    });
  }
}

export async function sendOtp(req, res) {
  try {
    const email = req.body?.email;
    const user = await userModel.findOne({ email }); // not for stroing in db
    // its for checking whether present in main db or not.

    if (!user) {
      return res.status(201).send({
        type: "error",
        payload: {
          message: "Internal Server Error at send OTP",
        },
      });
    }
    const otp_user = await otpModel.findOne({ email });

    if (otp_user) {
      if (otp_user.blockedUntil > new Date()) {
        return res.status(201).send({
          type: "error",
          payload: {
            message: "Too many attempts. Try after 3 minutes.",
          },
        });
      }

      if (otp_user.attempts >= 5) {
        otp_user.blockedUntil = new Date(Date.now() + 3 * 60 * 1000);
        otp_user.attempts = 0;
        await otp_user.save();
        return res.status(201).send({
          type: "error",
          payload: {
            message: "Too many attempts. Try after 3 minutes.",
          },
        });
      }
    }

    const otp = otpGenerator();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    const otpHash = await bcrypt.hash(otp, parseInt(config.SALT_ROUNDS));

    const mailToSend = getOtpHtml(otp);
    sendEmail(
      email,
      "OTP VERIFICATION",
      "DO NOT REPLY THIS IS THE OTP VERIFICATION MAIL",
      mailToSend,
    );
    res.send({
      type: "message",
      payload: {
        message: "EMAIL SENT",
      },
    });

    await otpModel.findOneAndUpdate(
      {
        email: email,
      },
      {
        $set: {
          attempts: 0,
          user: user._id,
          otpHash: otpHash,
          expiresAt: expiresAt,
        },
      },
      {
        upsert: true, // 3. CRITICAL: Creates the document if it doesn't exist
        new: true,
      },
    );
  } catch (err) {
    console.log(err);
    return res.status(201).send({
      type: "error",
      payload: {
        message: "Internal Server Error at send OTP" + err,
      },
    });
  }
}

export async function verifyOtp(req, res) {
  const email = req.body?.email;
  const otp = req.body?.otp;

  if (!email) {
    return res.status(400).send({
      type: "error",
      payload: { message: "Email is required." },
    });
  }

  if (!otp) {
    return res.status(400).send({
      type: "error",
      payload: { message: "OTP is required." },
    });
  }

  const user_otp = await otpModel.findOne({ email });

  if (!user_otp) {
    return res.status(400).send({
      type: "error",
      payload: { message: "Invalid or expired OTP." },
    });
  }

  if (user_otp.blockedUntil > new Date()) {
    return res.status(429).send({
      type: "error",
      payload: { message: "Too many attempts. Try after 3 minutes." },
    });
  }

  if (user_otp.expiresAt < new Date()) {
    await otpModel.findOneAndDelete({ email }); // clean up dead record
    return res.status(400).send({
      type: "error",
      payload: { message: "OTP Expired." },
    });
  }

  const decodedOtp = await bcrypt.compare(otp, user_otp.otpHash);

  if (!decodedOtp) {
    const updated = await otpModel.findOneAndUpdate(
      { email },
      { $inc: { attempts: 1 } },
      { new: true },
    );

    if (updated.attempts >= 5) {
      await otpModel.findOneAndUpdate(
        { email },
        { $set: { blockedUntil: new Date(Date.now() + 3 * 60 * 1000), attempts: 0 } },
      );

      return res.status(429).send({
        type: "error",
        payload: { message: "Too many attempts. Try after 3 minutes." },
      });
    }

    return res.status(400).send({
      type: "error",
      payload: { message: "Invalid OTP." },
    });
  }

  await otpModel.findOneAndDelete({ email });
  const users = await userModel.findOne({ email });
  users.isVerified = true;
  users.save();
  return await completeLogin(users, res);
}

export async function deleteAccount(req, res) {
  const email = req.body?.email;

  try {
    const user = await userModel.deleteOne({ email });
    if (!user) {
      return res.send({
        type: "error",
        payload: {
          message: "User Doesn't Exist",
        },
      });
    }
    return res.status(200).json({
      type: "message",
      payload: {
        message: "User Deleted",
        user: user,
      },
    });
  } catch (err) {
    return res.send({
      type: "error",
      payload: {
        message: "Internal Server Error",
        user: user,
      },
    });
  }
}