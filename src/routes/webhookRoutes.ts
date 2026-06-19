import express from "express";
const webhookRouter = express.Router(); 
import { handleClerkWebhook } from "../controllers/webhookController";

webhookRouter.post("/", handleClerkWebhook);

export default webhookRouter;