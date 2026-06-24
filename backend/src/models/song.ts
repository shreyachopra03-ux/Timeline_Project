import mongoose, { Schema, Document } from 'mongoose';

export interface ISong extends Document {
    clerkId: string;
    title: string;
    artist?: string;
    url: string;
    public_id: string;
    duration: number;
    fileSize?: number;
    createdAt: Date;
    updatedAt: Date;
};

const songSchema = new Schema<ISong>(
    {
        clerkId: { 
            type: String, 
            required: true 
        },
        title: { 
            type: String, 
            required: true 
        },
        artist: { 
            type: String, 
            default: '' 
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
        },
        fileSize: { 
            type: Number, 
            default: 0 
        }
    },
    { 
        timestamps: true 
    }
);

export default mongoose.model<ISong>('Song', songSchema);
