import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken"
export const verifyUser = async (req: Request, res: Response, next: NextFunction) => {
    const headers = req.headers.authorization;

    if (!headers) {
        return res.status(401).json({ message: "unauthorized" })
    }
    if (!headers.startsWith("Bearer ")) {
        return res.status(401).json({ message: "invalid token format" })
    }
    try {
        const extractedToken = headers.split(" ")[1];
        const validUser = jwt.verify(extractedToken, process.env.JWT_SECRET!);
        if (!validUser) {
            return res.status(401).json({ message: "invalid token" })
        }
        req.user = validUser as CustomJwtPayload;
        next();
    }
    catch (error) {
        return res.status(401).json({ message: "invalid token" })
    }

}
