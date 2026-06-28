import mongoose from "mongoose";

const loginSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Email required."],
        unique: [ true, "Email already exists."]
    },
    password: {
        type: String,
        required: [ true, "Enter a password"] 
    }
}) 

const loginModel = mongoose.model("login", loginSchema)

export default loginModel;