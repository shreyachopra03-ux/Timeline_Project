import mongoose, { Schema, Document } from 'mongoose';

export interface IClip extends Document {
    clerkId: string;
    title: string;
    url: string;
    public_id: string;
    duration: number;
    createdAt: Date;
    updatedAt: Date;
}

const clipSchema = new Schema<IClip>(
    {
        clerkId: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        },
        public_id: {
            type: String,
            required: true
        },
        duration: {
            type: Number,
            default: 0
        }
    },
    { timestamps: true }
);

export default mongoose.model<IClip>('Clip', clipSchema);