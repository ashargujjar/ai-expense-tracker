import { NextFunction, Request, Response } from "express";
import { chatZodSchema, expensesZodSchema, loginZodSchema, receiptZodSchema, userZodSchema } from "../schema/schema";

export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    const isvalid = loginZodSchema.safeParse({ email, password });
    if (!isvalid) {
        return res.status(400).json({ message: "invalid input" })
    }
    next();
}
export const validatesigup = (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body;
    const isvalid = userZodSchema.safeParse({ name, email, password });
    if (!isvalid) {
        return res.status(400).json({ message: "invalid input" })
    }
    next();
}
export const ValidateReceipt = (req: Request, res: Response, next: NextFunction) => {
    const { userId, imageUrl, uploadedAt } = req.body;
    const isvalid = receiptZodSchema.safeParse({ userId, imageUrl, uploadedAt });
    if (!isvalid) {
        return res.status(400).json({ message: "invalid input" })
    }
    next();

}
export const ValidateChat = (req: Request, res: Response, next: NextFunction) => {
    const { userId, messages } = req.body;
    const isvalid = chatZodSchema.safeParse({ userId, messages });
    if (!isvalid) {
        return res.status(400).json({ message: "invalid input" })
    }
    next();

}
export const ValidateExpense = (req: Request, res: Response, next: NextFunction) => {
    const { userId, amount, category, description, date } = req.body;
    const isvalid = expensesZodSchema.safeParse({ userId, amount, category, description, date });
    if (!isvalid) {
        return res.status(400).json({ message: "invalid input" })
    }
    next();

}

export const expenseformVerify = (req: Request, res: Response, next: NextFunction) => {
    const { items, totalAmount } = req.body;
    const isvalid = expensesZodSchema.safeParse({ items, totalAmount });
    if (!isvalid) {
        return res.status(400).json({ message: "invalid input" })
    }
    next();
}