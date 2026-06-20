import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['image', 'video'],
        default: 'image'
    },
    clerkId: {
        type: String,
    },
    url: {
        type: String,
    },
    public_id: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    },
    title: {
        type: String
    },
    tags: {
        type: [String]
    },
}, {
    timestamps: true
});

const Media = mongoose.model("Media", mediaSchema);

export default Media;