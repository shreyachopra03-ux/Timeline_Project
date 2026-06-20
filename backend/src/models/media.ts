import mongoose, { Schema, Document } from 'mongoose';
 
export interface IMedia extends Document {
    public_id: string;
    cloudinary_url: string;
    type: 'image' | 'video';
    duration: number;
    clerkId: string;
    fileName?: string;
    fileSize?: number;
    createdAt: Date;
    updatedAt: Date;
    date?: Date;
    title?: String;
    tags?: string[];
}
 
const mediaSchema = new Schema<IMedia>(
    {
        public_id: {
            type: String,
            required: true,
            unique: true
        },
        cloudinary_url: {
            type: String,
            required: true
        },
        type: {
            type: String,
            enum: ['image', 'video'],
            required: true
        },
        duration: {
            type: Number,
            default: 0
        },
        clerkId: {
            type: String,
            required: true
        },
        fileName: String,
        fileSize: Number
    },
    { 
        timestamps: true 
    }
);
 
export default mongoose.model<IMedia>('Media', mediaSchema);