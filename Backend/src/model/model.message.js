import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        roomId: String,
        userName: String,
        message: String
    },
    { 
        timestamps: true
    }
)

const messageModel = mongoose.model("message", messageSchema);

export default messageModel;