import mongoose from "mongoose";
import { Document, Schema } from "mongoose";

export interface IUser extends Document {
    clerkId: string,
    name: string,
    email: string,
    avatar: string,
    storageUsed: number
}

const userSchema = new Schema<IUser> ({
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

const User = mongoose.model<IUser>("User", userSchema);

export default User;