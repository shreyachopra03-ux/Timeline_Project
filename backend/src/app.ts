import "dotenv/config";
import express from "express";
import { clerkMiddleware } from "@clerk/express";
const app = express();
import webhookRouter from "./routes/webhookRoutes";
import { connectDB } from "./config/database";
import mediaRouter from "./routes/mediaRoute";
import clipRouter from "./routes/clipRoute"; 
import sharedRouter from "./routes/sharedRoute";

const PORT: any = Number(process.env.PORT) || 7777;

// Bypass tunnel header
app.use((req, res, next) => {
    res.setHeader("bypass-tunnel-reminder", "true");
    next()
});

app.use(clerkMiddleware());

app.use("/api/webhooks/clerk", express.raw({ type: "application/json" }), webhookRouter);

app.use(express.json({ limit: "100mb" })); 
app.use(express.urlencoded({ limit: "100mb", extended: true }));

app.use("/media", mediaRouter);
app.use("/clips", clipRouter);
app.use("/shared", sharedRouter);

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
    })