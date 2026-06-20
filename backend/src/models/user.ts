import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    clerkId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    avatar: {
        type: String,
        default: ""
    },
    storageUsed: {
        type: Number,
        default: 0
    },
}, {
    timestamps: true
});

const User = mongoose.model("User", userSchema);

export default User;