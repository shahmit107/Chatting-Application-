import jwt from "jsonwebtoken";
import config from "../config/config.js";

export function generateAccessToken(user) {
    const accessToken = jwt.sign(
        {
            userId: user._id
        },
        config.ACCESS_TOKEN_SECRET,
        { 
            expiresIn: config.ACCESS_TOKEN_EXPIRY
        }
    );
    return accessToken;
}   

export function generateRefreshToken(user) {
    const refreshToken = jwt.sign(
        {
            userId: user._id
        },
        config.REFRESH_TOKEN_SECRET,
        {
        expiresIn: config.REFRESH_TOKEN_EXPIRY
        }
    );
    return refreshToken;
}  