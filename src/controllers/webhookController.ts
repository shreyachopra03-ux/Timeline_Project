import "dotenv/config";
import { Request, Response } from "express";
import { Webhook } from "svix";
import User from "../models/user";

export const handleClerkWebhook = async (req: Request, res: Response) => {

    try {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
        if(!WEBHOOK_SECRET) {
        throw new Error("Missing CLERK_WEBHOOK_SECRET in .env file !")
        }

    // svix headers
    const svix_id = req.headers["svix-id"] as string;
    const svix_timestamp = req.headers["svix-timestamp"] as string;
    const svix_signature = req.headers["svix-signature"] as string;

    if(!svix_id || !svix_timestamp || !svix_signature) {
       return res.status(400).json({ error: "Missing svix headers"})
    }

    const payload = req.body.toString();

    const wh = new Webhook(WEBHOOK_SECRET);
    let evt: any;

    try {
        evt = wh.verify(payload, {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature
        })
    } catch (err) {
        console.error("Webhook verification falied: ", err);
        return res.status(400).json({ error: "Invalid webhook signature" })
    }

    const { type, data } = evt;

    // Handle User creation
    if(type === "user.created") {
        const { first_name, last_name, email_addresses, id, image_url } = data;

        const email = email_addresses?.[0]?.email_address;
        console.log(email);
        const name = `${first_name || ""}  ${last_name || ""}`.trim();

        if(!email) {
            return res.status(400).json({ error: "No email address found from clerk" });
        }

        await User.create({
            clerkId: id,
            name: name,
            email: email,
            avatar: image_url
        });

        console.log(`User ${name} successfully synced to MongoDB !`);
    };

    // Handle User update
    if(type === "user.updated") {
        const { first_name, last_name, id, image_url } = data;

        const name = `${first_name || ""} ${last_name || ""}`.trim();

        await User.findOneAndUpdate({
            clerkId: id,
            name: name,
            avatar: image_url
        });

        console.log(`User ${id} updated in MongoDB !`);
    };

    // Handle user deletion
    if(type === "user.deleted") {
        const { id } = data;
        await User.findOneAndDelete({ clerkId: id });

        console.log(`User ${id} deleted from MongoDB !`);
    };

    return res.status(200).json({ success: true, message: "webhook processed successfully."});
    }
    catch (err) {
        console.error("Error handling webhook :", err);
        return res.status(400).json({ error: "Internal server error !"})
}};




