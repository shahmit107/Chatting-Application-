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

    const isTokenValid = jwt.verify(accessToken, config.ACCESS_TOKEN_SECRET);

    const isUserPresent = await userModel.findById(isTokenValid.userId).lean();

    if(!isUserPresent) {
      return res.status(401).send(
        { 
          type: "error",
          payload: {
            message: "User not found" 
          } 
        });
    }

    req.userId = isTokenValid.userId;
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