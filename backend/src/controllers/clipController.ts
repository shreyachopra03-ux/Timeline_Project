import cloudinary from '../config/cloudinary';
import ffmpegStatic from 'ffmpeg-static';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { execSync } from 'child_process';
import { Request, Response } from 'express';
import Clip from '../models/clip';
import Media from '../models/media';
import youtubedl from 'youtube-dl-exec';

if (!ffmpegStatic) {
    // console.error('FATAL: ffmpeg-static resolved to null. FFmpeg binary not found.');
    process.exit(1);
}

const FFP_DIR = path.dirname(ffmpegStatic);
const FFPROBE_TARGET = path.join(FFP_DIR, 'ffprobe.exe');
if (!fs.existsSync(FFPROBE_TARGET)) {
    try {
        const ffprobePath = require('ffprobe-static').path;
        if (fs.existsSync(ffprobePath)) {
            fs.copyFileSync(ffprobePath, FFPROBE_TARGET);
            // console.log('[FFMPEG] Copied ffprobe.exe to ffmpeg-static directory');
        }
    } catch { }
}

interface AuthenticatedRequest extends Request {
    user?: { id: string };
};

const TEMP_DIR = path.join(process.cwd(), 'temp_clips');

if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
};

export const generateClip = async (req: AuthenticatedRequest, res: Response) => {
    let tempDir: string | null = null;

    try {
        const { mediaIds, title, audioUrl, audioVolume } = req.body;
        console.log('Received timeline request:', { mediaIds, title, audioUrl, audioVolume });

        if (!mediaIds || !Array.isArray(mediaIds) || mediaIds.length === 0) {
            return res.status(400).json({ success: false, message: "Please provide mediaIds array containing valid database ObjectIds!" });
        }

        const assets = await Media.find({ _id: { $in: mediaIds } }).lean().exec();
        console.log(`Found ${assets.length} assets in DB`);

        if (assets.length === 0) {
            return res.status(404).json({ success: false, message: "No matching media elements found in database!" });
        }

        const orderedAssets = mediaIds
            .map(id => assets.find(asset => asset._id.toString() === id.toString()))
            .filter((asset): asset is NonNullable<typeof asset> => asset !== null && asset !== undefined);

        tempDir = path.join(TEMP_DIR, `clip_${Date.now()}`);
        fs.mkdirSync(tempDir, { recursive: true });

        const localAssets: { path: string; type: string }[] = [];

        for (let i = 0; i < orderedAssets.length; i++) {
            const asset: any = orderedAssets[i]; 
            const targetUrl = asset.cloudinary_url;

            if (!targetUrl) {
                console.warn(`Asset at array sequence ${i} is missing an image/video source URL.`);
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

                console.log(`File downloaded successfully [${asset.type}]: ${filePath}`);
                localAssets.push({ path: filePath, type: asset.type });
            } catch (err) {
                console.error(`Failed downloading workspace asset index ${i}:`, err);
                throw new Error(`Cloud resource fetching failed on asset: ${i}`);
            }
        }

        if (localAssets.length === 0) {
            throw new Error('No local file artifacts prepared for compile sequence.');
        };

        const FFP = ffmpegStatic!;
        const outputPath = path.join(tempDir, 'timeline_output.mp4');

        const processedVideos: string[] = [];

        for (let i = 0; i < localAssets.length; i++) {
            const asset = localAssets[i];
            const tempVideo = path.join(tempDir, `seg_${i}.mp4`);

            const scaleFilter = "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,setsar=1";
            let cmd: string;

            if (asset.type === 'image') {
                cmd = `"${FFP}" -loop 1 -t 4 -i "${asset.path}" -vf "${scaleFilter}" -pix_fmt yuv420p -c:v libx264 -preset superfast -y "${tempVideo}"`;
            } else {
                cmd = `"${FFP}" -t 4 -i "${asset.path}" -vf "${scaleFilter}" -pix_fmt yuv420p -c:v libx264 -preset superfast -y "${tempVideo}"`;
            }

            console.log(`[FFMPEG] Segment ${i}: ${cmd}`);
            const segOut = execSync(cmd, { stdio: 'pipe', timeout: 120000 });
            console.log(`[FFMPEG] Segment ${i} stdout: ${segOut.toString().trim() || '(empty)'}`);
            console.log(`[FFMPEG] Segment ${i} done -> ${tempVideo}`);
            processedVideos.push(tempVideo);
        }

        const concatFile = path.join(tempDir, 'files.txt');
        const fileList = processedVideos.map(f => `file '${path.resolve(f).replace(/\\/g, '/')}'`).join('\n');
        fs.writeFileSync(concatFile, fileList);

        const concatCmd = `"${FFP}" -f concat -safe 0 -i "${concatFile}" -c copy -y "${outputPath}"`;
        // console.log(`[FFMPEG] Concat: ${concatCmd}`);
        const concatOut = execSync(concatCmd, { stdio: 'pipe', timeout: 180000 });
        // console.log(`[FFMPEG] Concat stdout: ${concatOut.toString().trim() || '(empty)'}`);
        // console.log('[FFMPEG] Concatenation complete:', outputPath);

        if (audioUrl) {
            const vol = typeof audioVolume === 'number' ? audioVolume : 0.3;
            // console.log(`[AUDIO] Downloading background audio from: ${audioUrl}`);
            const audioPath = path.join(tempDir, 'background_audio.mp3');

            const isYouTube = audioUrl.includes('youtube.com/watch') || audioUrl.includes('youtu.be/');
            if (isYouTube) {
                // console.log('[AUDIO] YouTube URL, using youtube-dl-exec to download + ffmpeg convert...');
                const ffmpegDir = path.dirname(ffmpegStatic!);
                await (youtubedl as any)(audioUrl, {
                    extractAudio: true,
                    audioFormat: 'mp3',
                    output: audioPath,
                    ffmpegLocation: ffmpegDir,
                    noWarnings: true,
                    noCheckCertificate: true,
                });
                // console.log('[AUDIO] YouTube audio downloaded + converted to MP3 via yt-dlp');
            } else {
                // console.log('[AUDIO] Direct URL, downloading via axios...');
                const audioRes = await axios.get(audioUrl, { responseType: 'stream', timeout: 60000 });
                await new Promise<void>((resolve, reject) => {
                    const ws = fs.createWriteStream(audioPath);
                    audioRes.data.pipe(ws);
                    ws.on('finish', resolve);
                    ws.on('error', reject);
                });
                // console.log('[AUDIO] Direct audio download complete');
            }

            const finalOutput = path.join(tempDir, 'timeline_with_audio.mp4');
            const audioCmd = `"${FFP}" -i "${outputPath}" -i "${audioPath}" -c:v copy -c:a aac -map 0:v:0 -map 1:a:0 -shortest -af "volume=${vol}" -y "${finalOutput}"`;
            // console.log(`[FFMPEG] Audio overlay: ${audioCmd}`);
            const aOut = execSync(audioCmd, { stdio: 'pipe', timeout: 180000 });
            // console.log(`[FFMPEG] Audio overlay stdout: ${aOut.toString().trim() || '(empty)'}`);
            // console.log('[FFMPEG] Audio overlay complete:', finalOutput);
            fs.renameSync(finalOutput, outputPath);
        }

        // console.log('Syncing generated output directly to Cloudinary storage server...');
        const uploadResult = await cloudinary.uploader.upload(outputPath, {
            resource_type: 'video',
            folder: 'timeline_clips',
            quality: 'auto'
        });

        // console.log('Cloudinary target production link received:', uploadResult.secure_url);

        const newClip = new Clip({
            clerkId: req.user?.id,
            title: title || `Timeline Clip ${new Date().toLocaleDateString()}`,
            url: uploadResult.secure_url,
            public_id: uploadResult.public_id,
            duration: uploadResult.duration || localAssets.length * 4
        });

        const savedClip = await newClip.save();

        return res.status(201).json({ success: true, message: "Clip generated and mapped successfully!", data: savedClip });

    } catch (err: any) {
        // console.error('Timeline Generation Fatal Exception:', err);
        return res.status(500).json({ success: false, error: err.message || 'Server operations aborted.' });

    } finally {
        if (tempDir && fs.existsSync(tempDir)) {
            try {
                fs.rmSync(tempDir, { recursive: true, force: true });
                // console.log('Cleaned up target temp workspace assets.');
            } catch (cleanupErr) {
                // console.error('Garbage collection warning:', cleanupErr);
            }
        }
    }
};

export const getAllClips = async (req: AuthenticatedRequest, res: Response) => {

    try {
        const clips = await Clip.find({ clerkId: req.user?.id }).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, count: clips.length, data: clips });
    } 
    catch (err: any) {
        return res.status(500).json({ success: false, error: err.message });
    }
};

export const getSingleClip = async (req: AuthenticatedRequest, res: Response) => {

    try {
        const { id } = req.params;
        const clip = await Clip.findOne({ _id: id, clerkId: req.user?.id });
        if (!clip) return res.status(404).json({ success: false, message: "Requested clip entry not found." });
        return res.status(200).json({ success: true, data: clip });
    } 
    catch (err: any) {
        return res.status(500).json({ success: false, error: err.message });
    }
};

export const renameClip = async (req: AuthenticatedRequest, res: Response) => {

    try {
        const { id } = req.params;
        const { title } = req.body;
        if (!title) return res.status(400).json({ success: false, message: "A replacement title field string is required." });

        const updatedClip = await Clip.findOneAndUpdate(
            { _id: id, clerkId: req.user?.id },
            { title },
            { new: true }
        );
        if (!updatedClip) return res.status(404).json({ success: false, message: "Clip not found." });
        return res.status(200).json({ success: true, data: updatedClip });
    }
    catch (err: any) {
        return res.status(500).json({ success: false, error: err.message });
    }
};

export const deleteClip = async (req: AuthenticatedRequest, res: Response) => {

    try {
        const { id } = req.params;
        const deletedClip = await Clip.findOneAndDelete({ _id: id, clerkId: req.user?.id });
        if (!deletedClip) return res.status(404).json({ success: false, message: "Target clip data element not located." });
        return res.status(200).json({ success: true, message: "Clip deleted successfully from server index." });
    } 
    catch (err: any) {
        return res.status(500).json({ success: false, error: err.message });
    }
};

