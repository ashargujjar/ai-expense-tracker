import mongoose from "mongoose";
import { Expenses, Receipt } from "../schema/schema";
import USER from "./user";
interface ExpenseItem {
  name: string;
  price: number;
  category: string;
  quantity: number;
}
interface ExpenseInput {
  items: ExpenseItem[];
  totalAmount: number;
  userId: string;
  totalItems: number;
  receiptId?: string;
  shop_name?: string;
}
class EXPENSE {
  items: ExpenseItem[];
  totalAmount: number;
  userId: string;
  totalItems: number;
  receiptId?: string | undefined;
  shop_name?: string | undefined;
  constructor(input: ExpenseInput) {
    this.items = input.items;
    this.totalAmount = input.totalAmount;
    this.userId = input.userId;
    this.totalItems = input.totalItems;
    this.receiptId = input.receiptId;
    this.shop_name = input.shop_name;
  }

  async save() {
    const expense = new Expenses({
      items: this.items,
      totalAmount: this.totalAmount,
      userId: this.userId,
      totalItems: this.totalItems,
      ...(this.receiptId && { receiptId: this.receiptId }),
      ...(this.shop_name && { shop_name: this.shop_name }),
    });
    await expense.save();
  }
  static async getExpenses(userId: string, page: number, limit: number) {
    const expenses = await Expenses.find({ userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    return expenses;
  }
  static async totalSpendings(userId: string) {
    // aggregate() does NOT auto-cast strings to ObjectId — must convert explicitly
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const totalSpendings = await Expenses.aggregate([
      {
        $match: { userId: userObjectId },
      },
      {
        $group: { _id: null, totalAmount: { $sum: "$totalAmount" } },
      },
    ]);
    return totalSpendings;
  }
  static async monthlySpendings(userId: string, year: number, month: number) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const monthlySpendings = await Expenses.aggregate([
      {
        $match: {
          userId: userObjectId,
          date: {
            $gte: new Date(year, month - 1, 1),
            $lt: new Date(year, month, 1),
          },
        },
      },
      {
        $group: { _id: null, totalAmount: { $sum: "$totalAmount" } },
      },
    ]);
    return monthlySpendings;
  }



  static async getHighestSpendings(userId: string) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const highestSpendings = await Expenses.aggregate([
      {
        $match: { userId: userObjectId },
      },
      {
        $sort: { totalAmount: -1 },
      },
      {
        $limit: 1,
      },
    ]);
    return highestSpendings;
  }

  static async averageSpendingByCategory(userId: string) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const averageSpendingByCategory = await Expenses.aggregate([
      {
        $match: { userId: userObjectId },
      },
      {
        $unwind: "$items",
      },
      {
        $group: {
          _id: "$items.category",
          averageAmount: { $avg: "$items.price" },
        },
      },
    ]);
    return averageSpendingByCategory;
  }
  static async uploadReceipt(userId: string, imageUrl: string) {
    const reciept = await Receipt.create({
      userId: userId,
      imageUrl: imageUrl,
    });
    return reciept;
  }
  static async remainingBudget(userId: string) {
    const userLimit = await USER.getMonthlylimit(userId);
    // Return null when limit isn't configured so frontend can fallback gracefully
    if (!userLimit || userLimit.monthlyLimit == null) return null;
    const now = new Date();
    const remaining = await this.monthlySpendings(userId, now.getFullYear(), now.getMonth() + 1);
    const spent = Number(remaining[0]?.totalAmount) || 0;
    const budgetLeft = Number(userLimit.monthlyLimit) - spent;
    return budgetLeft >= 0 ? budgetLeft : 0;
  }

}
export default EXPENSE;
