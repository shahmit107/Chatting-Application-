// it simply deals with whether the req must be allowed or not.
// Authorization: Bearer <token>   will be sent by the frontend.

// accessToken comes in → Authorization header
// refreshToken comes in → cookie (but that's only for the /refresh route, not this middleware)

import config from "../config/config.js";
import jwt from "jsonwebtoken";
import userModel from "../model/model.user.js";

export default async function authMiddleware(req, res, next) {
  try {
    const accessToken = req.headers.authorization?.split(" ")[1];

    if (!accessToken) {
      return res.status(401).send({
        type: "error",
        payload: { message: "Access token missing" },
      });
    }

    const isTokenValid = jwt.verify(accessToken, config.ACCESS_TOKEN_SECRET); // this automatically checks for the time expiry, the work is done internally by the verify function.
    // this doesn't return the bool vals but throws err on invalid token.

    const isUserPresent = await userModel.findById(isTokenValid.userId).lean();

    if (!isUserPresent) {
      return res.status(401).send({
        type: "error",
        payload: {
          message: "User not found",
        },
      });
    }

    if (!isUserPresent.isVerified) {
      return res.status(401).send({
        type: "error",
        payload: {
          message: "User is not verified",
        },
      });
    }

    req.userId = isTokenValid.userId;
    //await userModel.findOneAndUpdate({ id }, { isVerified: true });
    next();
  } catch (err) {
    return res.status(401).send({
      type: "error",
      payload: {
        message: "TOKEN EXPIRED" + err,
      },
    });
  }
}