import mongoose from "mongoose" 

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Email is Required"],
        unique: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: [ true, "User is required"]
    },
    otpHash: {
        type: String,
        required: [ true, "OTP hash is required"]
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 }
    },
    attempts: {
        type: Number,
    }, 
    blockedUntil: {
        type: Date,
    }
})

const otpModel = mongoose.model("otp", otpSchema)
export default otpModel;