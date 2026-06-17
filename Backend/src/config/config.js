import dotenv from 'dotenv';

dotenv.config();

if(!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not defined in the environment variables");
}

if(!process.env.WS_PORT) {
    throw new Error("WS_PORT is not defined in the environment variables");
}

if(!process.env.SALT_ROUNDS) {
    throw new Error("SALT_ROUNDS is not defined in the environment variables");
}

if(!process.env.ACCESS_TOKEN_SECRET) {
    throw new Error("ACCESS_TOKEN_SECRET is not defined in the environment variables");
}

if(!process.env.REFRESH_TOKEN_SECRET) {
    throw new Error("REFRESH_TOKEN_SECRET is not defined in the environment variables");
}

if(!process.env.ACCESS_TOKEN_EXPIRY) {
    throw new Error("ACCESS_TOKEN_EXPIRY is not defined in the environment variables");
}

if(!process.env.REFRESH_TOKEN_EXPIRY) {
    throw new Error("REFRESH_TOKEN_EXPIRY is not defined in the environment variables");
}

const config = {
    MONGO_URI: process.env.MONGO_URI,
    PORT: process.env.WS_PORT,
    SALT_ROUNDS: process.env.SALT_ROUNDS,
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
    ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY,
    REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY
}

export default config;