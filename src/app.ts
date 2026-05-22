import express from "express";
import { clerkMiddleware } from "@clerk/express";
const app = express();
import webhookRouter from "./routes/webhookRoutes";


// Middleware
app.use(clerkMiddleware());

// Routes
app.use("/api/webhooks", express.raw({ type: "application/json" }), webhookRouter);


app.use(express.json());


