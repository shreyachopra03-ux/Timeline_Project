import { getAuth } from "@clerk/express";
import type { Request, Response, NextFunction } from "express";

interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
    };
}

export const clerkAuthGuard = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    let auth;
    try {
        auth = getAuth(req);
    } catch (err: any) {
        console.error("[clerkAuthGuard] getAuth threw:", err.message);
        return res.status(401).json({
            success: false,
            message: `Auth error: ${err.message}`
        });
    }

    if (!auth || !auth.userId) {
        const reason = (auth as any)?.reason || "unknown";
        const status = (auth as any)?.status || "signed_out";
        console.error(`[clerkAuthGuard] Unauthorized - reason: ${reason}, status: ${status}, sessionClaims:`, (auth as any)?.sessionClaims);
        return res.status(401).json({
            success: false,
            message: "Unauthorized: Please sign in to continue.",
            debug: { reason, status }
        });
    }

    req.user = { id: auth.userId };
    next();
};