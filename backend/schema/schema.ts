import mongoose from "mongoose";
import { z } from "zod";

type UserType = {
    name: string;
    email: string;
    password: string;
}

type ReceiptsType = {
    userId: mongoose.Types.ObjectId;
    imageUrl: string;
    uploadedAt: Date;
}

type MessageType = {
    role: "user" | "ai";
    content: string;
}

type ChatType = {
    userId: mongoose.Types.ObjectId;
    messages: MessageType[];
}

export type ExpensesType = {
    userId: mongoose.Types.ObjectId;
    receiptId?: mongoose.Types.ObjectId;
    items: {
        name: string;
        category: string;
        price: number;
        quantity: number;
        total: number;
    }[];
    totalItems: number
    totalAmount: number;
    date: Date;

}

const userSchema = new mongoose.Schema<UserType>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const receiptSchema = new mongoose.Schema<ReceiptsType>({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    imageUrl: { type: String, required: true },
    uploadedAt: { type: Date, required: true, default: Date.now }
});

const chatSchema = new mongoose.Schema<ChatType>({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    messages: [{
        role: { type: String, enum: ['user', 'ai'], required: true },
        content: { type: String, required: true }
    }]
});

const expensesSchema = new mongoose.Schema<ExpensesType>({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiptId: { type: mongoose.Schema.Types.ObjectId, ref: 'Receipt', required: false, default: "" },
    items: [{
        name: { type: String, required: true },
        price: { type: Number, required: true },
        category: { type: String, required: true },
        quantity: { type: Number, required: true },
        total: { type: Number, required: true }
    }],
    totalItems: { type: Number, required: true },
    date: { type: Date, required: true, default: Date.now },
    totalAmount: { type: Number, required: true }
});

// zod schemas
export const userZodSchema = z.object({
    name: z.string().min(3, "name must be at least 3 characters").max(10, "name must be at most 10 characters"),
    email: z.string().email("invalid email"),
    password: z.string().min(3, "password must be at least 3 characters").max(10, "password must be at most 10 characters")
})
export const loginZodSchema = z.object({
    email: z.string().email(),
    password: z.string().min(3, "password must be at least 3 characters").max(10, "password must be at most 10 characters")
})
export const receiptZodSchema = z.object({
    userId: z.string(),
    imageUrl: z.string(),
    uploadedAt: z.date().optional()
})

export const chatZodSchema = z.object({
    userId: z.string(),
    messages: z.array(
        z.object({
            role: z.enum(["user", "ai"]),
            content: z.string()
        })
    )
})
export const expensesZodSchema = z.object({
    userId: z.string(),
    receiptId: z.string().optional(),
    items: z.array(
        z.object({
            name: z.string().min(1, "name must be at least 1 character").max(10, "name must be at most 10 characters"),
            price: z.number().min(1, "amount must be at least 1 character").max(10, "amount must be at most 10 characters"),
            category: z.string().min(1, "category must be at least 1 character").max(10, "category must be at most 10 characters"),
            quantity: z.number().min(1, "quantity must be at least 1 ").max(10, "quantity must be at most 10 "),
            total: z.number().min(1, "quantity must be at least 1 ").max(10, "total must be at most 10 "),
        })
    ),
    date: z.date().optional(),
    totalItems: z.number().min(1, "totalAmount must be at least 1 ").max(10, "totalAmount must be at most 10 "),
    totalAmount: z.number().min(1, "totalAmount must be at least 1 character").max(10, "totalAmount must be at most 10 characters"),
})


export const User = mongoose.model("User", userSchema);
export const Receipt = mongoose.model("Receipt", receiptSchema);
export const Chat = mongoose.model("Chat", chatSchema);
export const Expenses = mongoose.model("Expenses", expensesSchema);