import mongoose, { Schema, Document } from 'mongoose';

export interface ISharedMember {
    clerkId: string;
    name?: string;
    email?: string;
}

export interface IShared extends Document {
    ownerId: string;
    title: string;
    description?: string;
    mediaIds: mongoose.Types.ObjectId[];
    members: ISharedMember[];
    inviteCode: string;
    createdAt: Date;
    updatedAt: Date;
}

const sharedSchema = new Schema<IShared>(
    {
        ownerId: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            default: '',
        },
        mediaIds: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Media',
            },
        ],
        members: [
            {
                clerkId: { type: String, required: true },
                name: { type: String },
                email: { type: String },
            },
        ],
        inviteCode: {
            type: String,
            unique: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model<IShared>('Shared', sharedSchema);
