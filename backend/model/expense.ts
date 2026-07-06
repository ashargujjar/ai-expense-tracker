import mongoose from "mongoose";
import { Expenses, Receipt } from "../schema/schema";
interface ExpenseItem {
    name: string;
    price: number;
    category: string;
    quantity: number;
}

class EXPENSE {
    items: ExpenseItem[];
    totalAmount: number;
    userId: string;
    totalItems: number;
    receiptId?: string | undefined;

    constructor(items: ExpenseItem[], totalAmount: number, userId: string, totalItems: number, receiptId: string | undefined = undefined) {
        this.items = items;
        this.totalAmount = totalAmount;
        this.userId = userId;
        this.totalItems = totalItems;
        this.receiptId = receiptId;
    }
    async save() {
        const expense = new Expenses({
            items: this.items,
            totalAmount: this.totalAmount,
            userId: this.userId,
            totalItems: this.totalItems,
            ...(this.receiptId && { receiptId: this.receiptId })
        });
        await expense.save();
    }
    static async getExpenses(userId: string, page: number, limit: number) {
        const expenses = await Expenses.find({ userId }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
        return expenses;
    }
    static async totalSpendings(userId: string) {
        const totalSpendings = await Expenses.aggregate([
            {
                $match: { userId: userId }
            },
            {
                $group: { _id: null, totalAmount: { $sum: "$totalAmount" } }
            }
        ]);
        return totalSpendings;
    }
    static async monthlySpendings(userId: string, year: number, month: number) {
        const monthlySpendings = await Expenses.aggregate([
            {
                $match: {
                    userId: userId,
                    date: {
                        $gte: new Date(year, month - 1, 1),
                        $lt: new Date(year, month, 1)
                    }
                }
            },
            {
                $group: { _id: null, totalAmount: { $sum: "$totalAmount" } }
            }
        ]);
        return monthlySpendings;
    }

    static async getHighestSpendings(userId: string) {
        const highestSpendings = await Expenses.aggregate([
            {
                $match: { userId: userId }
            },
            {
                $sort: { totalAmount: -1 }
            },
            {
                $limit: 1
            }
        ]);
        return highestSpendings;
    }

    static async averageSpendingByCategory(userId: string) {
        const averageSpendingByCategory = await Expenses.aggregate([
            {
                $match: { userId: userId }
            },
            {
                $unwind: "$items"
            },
            {
                $group: { _id: "$items.category", averageAmount: { $avg: "$items.price" } }
            }
        ]);
        return averageSpendingByCategory;
    }
    static async uploadReceipt(userId: string, imageUrl: string) {
        const reciept = await Receipt.create({
            userId: userId,
            imageUrl: imageUrl
        })
        return reciept;
    }
}
export default EXPENSE