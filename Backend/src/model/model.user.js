import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true, // doesn't remove the space bet the words, just remove the unwanted space around the words
    },

    password: {
      type: String,
      required: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    joinedRooms: {
      type: [String],
      default: [],
    }, 
    refreshToken: {
        type: String
    }, 
    otp: {
      type: String
    }, 
    expiresAt: {
      type: String
    }
  },
  { timestamps: true }
);

const userModel = mongoose.model("user", userSchema)

export default userModel;