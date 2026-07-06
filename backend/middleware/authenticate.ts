import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken"
import { User } from "../schema/schema";
interface CustomJwtPayload extends jwt.JwtPayload {
    id: string;
}
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
        const validUser = jwt.verify(extractedToken, process.env.JWT_SECRET!) as CustomJwtPayload;
        const userId = validUser.id;

        if (!validUser) {
            return res.status(401).json({ message: "invalid token" })
        }
        const userExists = await User.findById(userId);
        if (!userExists) {
            return res.status(401).json({ message: "user not found" })
        }
        req.user = validUser as CustomJwtPayload;

        next();
    }
    catch (error) {
        return res.status(401).json({ message: "invalid token" })
    }

}
