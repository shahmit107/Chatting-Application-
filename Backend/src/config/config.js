import dotenv from 'dotenv';

dotenv.config();

if(!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not defined in the environment variables");
}

if(!process.env.PORT) {
    throw new Error("PORT is not defined in the environment variables");
}
const config = {
    MONGO_URI: process.env.MONGO_URI,
    PORT: process.env.PORT
}

export default config;