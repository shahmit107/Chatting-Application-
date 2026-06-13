import mongoose from "mongoose";

const loginSchema = new mongoose.Schema({
    phoneNumber: {
        type: Number,
        required: [true, "Mobile number required."],
        unique: [ true, "Number already exists."]
    },
    password: {
        type: String,
        required: [ true, "Enter a password"] 
    }
}) 

const loginModel = mongoose.model("login", loginSchema)

export default loginModel;