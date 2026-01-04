import { Request, Response, NextFunction } from "express";
import { verifyAcessToken } from "./jwt";

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer")) return res.status(401).json({ error: "Unauthorized"});
    try {
        const payload = verifyAcessToken(header.substring(7));
        (req as any).user = payload;
        next();

    } catch {
        res.status(401).json({ error: "Invalid token" });

    }
    
};

export const requiredRole = (role: "admin" | "instructor" | "student") => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user;
        if (!user || user.role !== role) return res.status(403).json({ error: "Forbiddern" });
            next();
        
    };
};