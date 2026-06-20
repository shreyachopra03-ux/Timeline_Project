import { v2 as cloudinary } from 'cloudinary';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { Request, Response } from 'express';
import Clip from '../models/clip';
import Media from '../models/media';

if (ffmpegStatic) {
    ffmpeg.setFfmpegPath(ffmpegStatic);
}

const MOCK_CLERK_ID = "6a0dc1a501c893d45ac99b3e";
const TEMP_DIR = path.join(process.cwd(), 'temp_clips');

if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
}

export const generateClip = async (req: Request, res: Response) => {
    let tempDir: string | null = null;

    try {
        const { mediaIds, title } = req.body;

        console.log('📥 Received timeline request:', { mediaIds, title });

        if (!mediaIds || !Array.isArray(mediaIds) || mediaIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please provide mediaIds array containing valid database ObjectIds!"
            });
        }

        // 1. Fetch from database using .lean() to clear out TS Document warnings
        const assets = await Media.find({ _id: { $in: mediaIds } }).lean().exec();
        console.log(`✅ Found ${assets.length} assets in DB`);

        if (assets.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No matching media elements found in database!"
            });
        }

        // 2. Map and maintain precise client sorting sequencing
        const orderedAssets = mediaIds
            .map(id => assets.find(asset => asset._id.toString() === id.toString()))
            .filter((asset): asset is NonNullable<typeof asset> => asset !== null && asset !== undefined);

        // 3. Setup safe workflow localized directory
        tempDir = path.join(TEMP_DIR, `clip_${Date.now()}`);
        fs.mkdirSync(tempDir, { recursive: true });

        // 4. Download source links locally to the worker space
        const localAssets: { path: string; type: string }[] = [];

        for (let i = 0; i < orderedAssets.length; i++) {
            const asset: any = orderedAssets[i]; 
            const targetUrl = asset.cloudinary_url || asset.url; 

            if (!targetUrl) {
                console.warn(`⚠️ Asset at array sequence ${i} is missing an image/video source URL.`);
                continue;
            }

            const ext = asset.type === 'video' ? '.mp4' : '.jpg';
            const filePath = path.join(tempDir, `input_${i}${ext}`);

            try {
                const response = await axios.get(targetUrl, {
                    responseType: 'stream',
                    timeout: 45000
                });

                await new Promise<void>((resolve, reject) => {
                    const stream = fs.createWriteStream(filePath);
                    response.data.pipe(stream);
                    stream.on('finish', resolve);
                    stream.on('error', reject);
                });

                console.log(`⬇️ File downloaded successfully [${asset.type}]: ${filePath}`);
                localAssets.push({ path: filePath, type: asset.type });
            } catch (err) {
                console.error(`❌ Failed downloading workspace asset index ${i}:`, err);
                throw new Error(`Cloud resource fetching failed on asset: ${i}`);
            }
        }

        if (localAssets.length === 0) {
            throw new Error('No local file artifacts prepared for compile sequence.');
        }

        // 5. Initialize Core FFmpeg Video Processing Flow Engine
        const outputPath = path.join(tempDir, 'timeline_output.mp4');
        const ffCommand = ffmpeg();

        let filterComplex = "";
        let concatInputs = "";

localAssets.forEach((asset: { path: string; type: string }, index: number) => {
    ffCommand.input(asset.path);

    if (asset.type === 'image') {
        ffCommand.inputOptions(['-loop 1', '-t 4']);

        filterComplex += `[${index}:v]scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,setsar=1[v${index}];`;
        filterComplex += `anullsrc=channel_layout=stereo:sample_rate=44100:d=4[a${index}];`;
    } else {
        filterComplex += `[${index}:v]scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,setsar=1[v${index}];`;
        filterComplex += `anullsrc=channel_layout=stereo:sample_rate=44100:d=4[a${index}];`;
    }

    concatInputs += `[v${index}][a${index}]`;
});

filterComplex += `${concatInputs}concat=n=${localAssets.length}:v=1:a=1[outv][outa]`;

        console.log('🎬 Launching multi-track timeline video stitching operations...');

        // 6. Running processing loops
        await new Promise<void>((resolve, reject) => {
            ffCommand
                .complexFilter(filterComplex)
                .map('[outv]')
                .map('[outa]')
                .videoCodec('libx264')
                .audioCodec('aac')
                .outputOptions([
                    '-pix_fmt yuv420p',
                    '-preset superfast',
                    '-vsync vfr'
                ])
                .output(outputPath)
                .on('start', (cmd) => console.log('🚀 Running FFmpeg compiler processing filters...'))
                .on('end', () => {
                    console.log('✅ Final stitching operation wrapped successfully.');
                    resolve();
                })
                .on('error', (err) => {
                    console.error('❌ Pipeline operational runtime crash:', err);
                    reject(err);
                })
                .run();
        });

        // 7. Store high-performance artifact up onto Cloudinary CDN bucket
        console.log('☁️ Syncing generated output directly to Cloudinary storage server...');
        const uploadResult = await cloudinary.uploader.upload(outputPath, {
            resource_type: 'video',
            folder: 'timeline_clips',
            quality: 'auto'
        });

        console.log('🚀 Cloudinary target production link received:', uploadResult.secure_url);

        // 8. Log the asset mapping entry to Database
        const newClip = new Clip({
            clerkId: MOCK_CLERK_ID,
            title: title || `Timeline Clip ${new Date().toLocaleDateString()}`,
            url: uploadResult.secure_url,
            public_id: uploadResult.public_id,
            duration: uploadResult.duration || localAssets.length * 4
        });

        const savedClip = await newClip.save();

        return res.status(201).json({
            success: true,
            message: "🎉 Clip generated and mapped successfully!",
            data: savedClip
        });

    } catch (err: any) {
        console.error('💥 Timeline Generation Fatal Exception:', err);
        return res.status(500).json({
            success: false,
            error: err.message || 'Server operations aborted.'
        });
    } finally {
        if (tempDir && fs.existsSync(tempDir)) {
            try {
                fs.rmSync(tempDir, { recursive: true, force: true });
                console.log('🧹 Cleaned up target temp workspace assets.');
            } catch (cleanupErr) {
                console.error('Garbage collection warning:', cleanupErr);
            }
        }
    }
};

export const getAllClips = async (req: Request, res: Response) => {
    try {
        const clips = await Clip.find({ clerkId: MOCK_CLERK_ID }).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, count: clips.length, data: clips });
    } catch (err: any) {
        return res.status(500).json({ success: false, error: err.message });
    }
};

export const getSingleClip = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const clip = await Clip.findOne({ _id: id, clerkId: MOCK_CLERK_ID });
        if (!clip) return res.status(404).json({ success: false, message: "Requested clip entry not found." });
        return res.status(200).json({ success: true, data: clip });
    } catch (err: any) {
        return res.status(500).json({ success: false, error: err.message });
    }
};

export const renameClip = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title } = req.body;
        if (!title) return res.status(400).json({ success: false, message: "A replacement title field string is required." });

        const updatedClip = await Clip.findOneAndUpdate(
            { _id: id, clerkId: MOCK_CLERK_ID },
            { title },
            { new: true }
        );
        if (!updatedClip) return res.status(404).json({ success: false, message: "Clip not found." });
        return res.status(200).json({ success: true, data: updatedClip });
    } catch (err: any) {
        return res.status(500).json({ success: false, error: err.message });
    }
};

export const deleteClip = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deletedClip = await Clip.findOneAndDelete({ _id: id, clerkId: MOCK_CLERK_ID });
        if (!deletedClip) return res.status(404).json({ success: false, message: "Target clip data element not located." });
        return res.status(200).json({ success: true, message: "Clip deleted successfully from server index." });
    } catch (err: any) {
        return res.status(500).json({ success: false, error: err.message });
    }
};