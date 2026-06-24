import "dotenv/config";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import youtubedl from "youtube-dl-exec";
import Song from "../src/models/song";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface SongSeed {
  title: string;
  artist: string;
  query: string;
}

const SONGS: SongSeed[] = [
  { title: "Chaleya", artist: "Arijit Singh, Shilpa Rao", query: "Chaleya Arijit Singh Jawan official audio" },
  { title: "Kesariya", artist: "Arijit Singh", query: "Kesariya Arijit Singh Brahmastra official audio" },
  { title: "O Maahi", artist: "Arijit Singh, Pritam", query: "O Maahi Arijit Singh Dunki official audio" },
  { title: "Satranga", artist: "Arijit Singh", query: "Satranga Arijit Singh Animal official audio" },
  { title: "Heeriye", artist: "Jasleen Royal, Arijit Singh", query: "Heeriye Jasleen Royal Arijit Singh official audio" },
  { title: "What Jhumka", artist: "Amitabh Bhattacharya", query: "What Jhumka Rocky Aur Rani official audio" },
  { title: "Tum Kya Mile", artist: "Arijit Singh, Shreya Ghoshal", query: "Tum Kya Mile Rocky Aur Rani official audio" },
  { title: "Dil Jhoom", artist: "Mithoon, Arijit Singh", query: "Dil Jhoom Mithoon Gadar 2 official audio" },
  { title: "Khalasi", artist: "Aditya Gadhvi, Achint", query: "Khalasi Aditya Gadhvi official audio" },
  { title: "Zihaal e Miskin", artist: "Vishal Mishra", query: "Zihaal e Miskin Vishal Mishra official audio" },
];

const TMP_DIR = path.resolve(__dirname, "../.tmp-seed");
const SYSTEM_CLERK_ID = "system";

async function downloadAudio(song: SongSeed, index: number): Promise<string> {
  const outputPath = path.join(TMP_DIR, `${index}-${song.title.replace(/[^a-zA-Z0-9]/g, "_")}.%(ext)s`);
  console.log(`[${index + 1}/${SONGS.length}] Searching: ${song.query}`);

  const output = await youtubedl(`ytsearch:${song.query}`, {
    extractAudio: true,
    audioFormat: "mp3",
    output: outputPath,
    noPlaylist: true,
    quiet: true,
    noWarnings: true,
  });

  const stdout = typeof output === "string" ? output : String(output ?? "");
  const match = stdout.match(/Destination:\s+(.+\.mp3)/i);
  if (match) {
    return match[1];
  }

  const files = fs.readdirSync(TMP_DIR).filter((f) => f.endsWith(".mp3"));
  const latest = files
    .map((f) => ({ name: f, time: fs.statSync(path.join(TMP_DIR, f)).mtimeMs }))
    .sort((a, b) => b.time - a.time);
  if (latest.length > 0) {
    return path.join(TMP_DIR, latest[0].name);
  }

  throw new Error("Could not find downloaded file");
}

async function uploadToCloudinary(filePath: string, title: string) {
  console.log(`  Uploading to Cloudinary...`);
  const result = await cloudinary.uploader.upload(filePath, {
    resource_type: "video",
    folder: "songs",
    public_id: `bollywood_${title.replace(/[^a-zA-Z0-9]/g, "_")}`,
  });
  return result;
}

async function seed() {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI not set in .env");
    process.exit(1);
  }
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    console.error("Cloudinary env vars not set in .env");
    process.exit(1);
  }

  fs.mkdirSync(TMP_DIR, { recursive: true });

  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB\n");

  for (let i = 0; i < SONGS.length; i++) {
    const song = SONGS[i];
    try {
      const existing = await Song.findOne({ title: song.title, clerkId: SYSTEM_CLERK_ID });
      if (existing) {
        console.log(`[${i + 1}/${SONGS.length}] "${song.title}" already exists, skipping\n`);
        continue;
      }

      const filePath = await downloadAudio(song, i);
      console.log(`  Downloaded: ${path.basename(filePath)}`);

      const cloudResult = await uploadToCloudinary(filePath, song.title);
      console.log(`  Cloudinary: ${cloudResult.secure_url}`);

      await Song.create({
        clerkId: SYSTEM_CLERK_ID,
        title: song.title,
        artist: song.artist,
        url: cloudResult.secure_url,
        public_id: cloudResult.public_id,
        duration: Math.round(cloudResult.duration ?? 0),
        fileSize: cloudResult.bytes ?? 0,
      });

      console.log(`  Saved to DB\n`);

      fs.unlinkSync(filePath);
    } catch (err) {
      console.error(`[${i + 1}/${SONGS.length}] Error processing "${song.title}":`, err, "\n");
    }
  }

  fs.rmSync(TMP_DIR, { recursive: true, force: true });
  await mongoose.disconnect();
  console.log("Done!");
}

seed();
