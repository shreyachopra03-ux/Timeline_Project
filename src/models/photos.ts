import mongoose from "mongoose";

const photoSchema = new mongoose.Schema({
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
    }
}, {
    timestamps: true
});

const Photos = mongoose.model("Photos", photoSchema);

export default Photos;