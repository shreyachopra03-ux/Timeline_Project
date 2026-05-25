import mongoose from "mongoose";

const photoSchema = new mongoose.Schema({
    clerkId: {
        type: String,
        unique: true,
        required: true,
    },
    url: {
        type: String,
    },
    public_id: {
        type: String
    },
    date: {
        type: Date
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