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

if(!process.env.GOOGLE_CLIENT_ID) {
    throw new Error("GOOGLE_CLIENT_ID is not defined in the environment variables");
}

if(!process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error("GOOGLE_CLIENT_SECRET is not defined in the environment variables");
}

if(!process.env.GOOGLE_REFRESH_TOKEN) {
    throw new Error("GOOGLE_REFRESH_TOKEN is not defined in the environment variables");
}

if(!process.env.GOOGLE_USER) {
    throw new Error("GOOGLE_USER is not defined in the environment variables");
}

if(!process.env.EMAIL_APP_PASSWORD) {
    throw new Error("EMAIL_APP_PASSWORD is not defined in the environment variables");
}

if(!process.env.CLOUDINARY_URL) {
    throw new Error("CLOUDINARY_URL is not defined in the environment variables");
}

if(!process.env.CLOUDINARY_API_SECRET) {
    throw new Error("CLOUDINARY_API_SECRET is not defined in the environment variables");
}

if(!process.env.CLOUDINARY_API_KEY) {
    throw new Error("CLOUDINARY_API_KEY is not defined in the environment variables");
}

if(!process.env.CLOUD_NAME) {
    throw new Error("CLOUD_NAME is not defined in the environment variables");
}

const config = {
    MONGO_URI: process.env.MONGO_URI,
    PORT: process.env.WS_PORT,
    SALT_ROUNDS: process.env.SALT_ROUNDS,
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
    ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY,
    REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN,
    GOOGLE_USER: process.env.GOOGLE_USER,
    EMAIL_APP_PASSWORD: process.env.EMAIL_APP_PASSWORD,
    CLOUDINARY_URL: process.env.CLOUDINARY_URL,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUD_NAME: process.env.CLOUD_NAME
}

export default config;