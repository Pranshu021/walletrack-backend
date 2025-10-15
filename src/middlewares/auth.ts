import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import logger from "../utils/logger";
import { ValidationError } from "../errors";

export interface AuthRequest extends Request {
    user?: { userId: string; role?: string };
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const auth = req.headers.authorization;
        if(!auth || !auth.startsWith("Bearer ")) return next(new ValidationError("No Access token provided"));

        const token = auth.split(" ")[1];
        const payload = verifyAccessToken(token) as any;

        req.user = { userId: payload.userId, role: payload.role }
        next();
    } catch(error) {
        logger.warn("Access token verification failed: " + (error as Error).message);
        next(new ValidationError("Invalid or expired access token"));
    }
};