import "dotenv/config";
import express from "express";
import connectDB from "./config/database";
const app = express();
const PORT:number = Number(process.env.PORT) || 7777;
import authRouter from "./routes/auth";

app.use(express.json());

// Routes
app.use("/", authRouter);

function startServer(port: number) {
    const server = app.listen(port, () => {
        console.log(`Server is listening on port ${port}`);
    });

    server.on('error', (err: any) => {
        if(err.code === "EADDRINUSE") {
            const nextPort = port + 1;
            console.log(`Port ${port} is already in use, so trying on port ${port + 1}...`);
            startServer(nextPort);
        }
        else {
            console.error('Server error:', err);
        }
    });
};

connectDB()
    .then(() => {
        console.log('Database is connected successfully...');
        startServer(PORT);
    })
    .catch((err) => {
        console.error("Databsed connection failed : ", err)
        process.exit(1);
    });

