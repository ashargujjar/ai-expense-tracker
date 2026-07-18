import { Request, Response } from "express"
import bcrypt from "bcrypt"
import USER from "../model/user";
import jwt from "jsonwebtoken";
import { User } from "../schema/schema";
import axios from "axios";
export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ message: "all fields are required" })
    }
    try {

        const user = await USER.find(email);
        if (!user) {
            return res.status(401).json({ message: "user not found" })
        }
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: "invalid password" })
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: "1h" });
        res.status(200).json({
            message: "user logged in successfully",
            token,
            user: {
                name: user.name,
                email: user.email
            }
        })
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "internal server error" })
    }
}
export const signUp = async (req: Request, res: Response) => {

    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: "all fields are required" })
    }
    try {
        const alreadyUser = await USER.find(email);
        if (alreadyUser) {
            return res.status(400).json({ message: "user already exists" })
        }
        const hasPassword = await bcrypt.hash(password, 10);
        const user = new USER(name, email, hasPassword);
        user.save();
        res.status(200).json({ message: "user created successfully" })

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "internal server error" })
    }

}

export const setMonthlyLimit = async (req: Request, res: Response) => {
    const { limit } = req.body;
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ message: "unauthorized" });
    }
    try {
        const save = await USER.setMonthlyLimit(limit, userId);
        if (save) {
            res.status(200).json({ message: "user limit updated successfully" })

        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "internal server error" })
    }
}
export const getMonthlylimit = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ message: "unauthorized" });
    }
    try {
        const limit = await USER.getMonthlylimit(userId);
        return res.status(200).json({ limit: limit })

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "internal server error" })
    }
}
export const chatwithgpt = async (req: Request, res: Response) => {
    const { message } = req.body;
    if (!message) {
        return res.status(400).json({ message: "message is required" });
    }
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: "unauthorized" });
    }
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
    try {
        const response = await axios.post(`${process.env.PYTHON_URL}/chat`, {
            message,
            jwt: token,
        });
        return res.status(200).json(response.data);
    } catch (error: any) {
        console.log(error);
        const status = error.response?.status || 500;
        const data = error.response?.data || { success: false, error: "internal server error" };
        return res.status(status).json(data);
    }
}
