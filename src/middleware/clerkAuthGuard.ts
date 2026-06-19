import { getAuth } from "@clerk/express";
import type { Request, Response, NextFunction } from "express";

interface CustomAuthRequest extends Request {
    user?: {
        id: string;
    };
}

export const clerkAuthGuard = (req: CustomAuthRequest, res: Response, next: NextFunction) => {
    const { userId } = getAuth(req);

    if (!userId) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized: Please sign in to upload photos."
        });
    }

    req.user = { id: userId };
    next();
};