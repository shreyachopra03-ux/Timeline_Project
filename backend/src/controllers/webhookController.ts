import "dotenv/config";
import { Request, Response } from "express";
import { Webhook } from "svix";
import User from "../models/user";

export const handleClerkWebhook = async (req: Request, res: Response) => {
    try {
        const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

        if (!WEBHOOK_SECRET) {
            console.error("Missing CLERK_WEBHOOK_SECRET in .env file!");
            return res.status(500).json({ error: "Server configuration error" });
        }

        const svix_id = req.headers["svix-id"] as string;
        const svix_timestamp = req.headers["svix-timestamp"] as string;
        const svix_signature = req.headers["svix-signature"] as string;

        if (!svix_id || !svix_timestamp || !svix_signature) {
            return res.status(400).json({ error: "Missing svix headers! Request blocked." });
        }

        const payload = req.body.toString();

        const wh = new Webhook(WEBHOOK_SECRET);
        let evt: any;

        try {
            evt = wh.verify(payload, {
                "svix-id": svix_id,
                "svix-timestamp": svix_timestamp,
                "svix-signature": svix_signature
            });
        } catch (err) {
            console.error("Webhook verification failed!");
            return res.status(400).json({ error: "Invalid webhook signature!" });
        }

        const { type, data } = evt;

        if (type === "user.created" || type === "user.updated") {
            const { first_name, last_name, email_addresses, id, image_url } = data;

            const email = email_addresses?.[0]?.email_address;
            const name = [first_name, last_name]
                .filter(Boolean)
                .map((part: string) => part.trim())
                .join(" ")
                .replace(/\s+/g, " ");

            if (!email) {
                return res.status(400).json({ error: "No email address found from Clerk" });
            }

            await User.findOneAndUpdate(
                {
                    $or: [
                        { clerkId: id },
                        { email: email }
                    ]
                },
                {
                    clerkId: id,
                    name: name,
                    email: email,
                    avatar: image_url
                },
                {
                    upsert: true,
                    new: true,
                    runValidators: true
                }
            );

            console.log(`User ${name || id} synced to MongoDB!`);
        }

        if (type === "user.deleted") {
            const { id } = data;

            await User.findOneAndDelete({ clerkId: id });
            console.log(`User ${id} deleted from MongoDB!`);
        }

        return res.status(200).json({
            success: true,
            message: "Webhook processed successfully."
        });

    } catch (err: any) {
        console.error("Error handling webhook:", err.message);
        return res.status(500).json({ error: "Internal server error!" });
    }
};