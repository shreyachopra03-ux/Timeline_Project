import "dotenv/config";
import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
const app = express();
import webhookRouter from "./routes/webhookRoutes";
import { connectDB } from "./config/database";
import mediaRouter from "./routes/mediaRoute";
import clipRouter from "./routes/clipRoute"; 
import sharedRouter from "./routes/sharedRoute";
import songRouter from "./routes/songRoute";

const PORT: any = Number(process.env.PORT) || 7777;

const allowedOrigins = [
    "https://timeline-project-eosin.vercel.app", 
    "http://localhost:5173",                    
    "http://localhost:3000"                      
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true 
}));

app.use("/api/webhooks/clerk", express.raw({ type: "application/json" }), webhookRouter);

app.use(express.json({ limit: "100mb" })); 
app.use(express.urlencoded({ limit: "100mb", extended: true }));

app.use("/api/media", mediaRouter);
app.use("/api/clips", clipRouter);
app.use("/api/shared", sharedRouter);
app.use("/api/songs", songRouter);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Internal server error'
    });
});

function startServer(port: number) {
    const server = app.listen(port, () => {
        console.log(`Server is listening on port ${port}`);
    });

    server.on('error', (err: any) => {
        if(err.code === "EADDRINUSE") {
            const nextPort = port + 1;
            console.log(`Port ${port} is already in use..., so trying ${port + 1}`);
            startServer(nextPort);
        } else {
            console.error("Server error:" , err);
        }
    });
};

connectDB()
    .then(() => {
        console.log("Database connected successfully !");
        startServer(PORT);
    })
    .catch(() => {
        console.error("Databse connection failed !");
        process.exit(1);
    });