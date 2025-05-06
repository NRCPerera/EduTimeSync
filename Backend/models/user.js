const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["Admin", "LIC", "Examiner", "Student"], required: true },
    nic: { type: String, required: true }, 
    phoneNumber: { type: String, required: true, match: /^\d{10}$/ }, // Phone number validation
    address: { type: String, required: true },
    profilePic: { type: String, default: "default.jpg" }, 
});

module.exports = mongoose.model("User", UserSchema);
