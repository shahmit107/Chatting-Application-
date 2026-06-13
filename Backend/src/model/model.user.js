import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        userName: String,
        joinedRooms: [String]
    },
    {
        timestamps: true
    }
)

const userModel = mongoose.model("user", userSchema)

export default userModel;