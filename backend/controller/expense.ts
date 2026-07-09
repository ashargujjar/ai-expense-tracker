import { Request, Response } from "express";
import { ExpensesType } from "../schema/schema";
import EXPENSE from "../model/expense";
import { recieptQue } from "../utils/que";
import path from "path";
export const addExpenseThroughform = async (
  req: Request<{}, {}, ExpensesType>,
  res: Response,
) => {
  const { items, totalAmount, totalItems } = req.body;
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ message: "unauthorized" });
  }

  try {
    const expense = new EXPENSE(items, totalAmount, userId, totalItems);
    await expense.save();
    return res.status(200).json({ message: "expense added successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "internal server error" });
  }
};
export const getTotalSpendings = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ message: "unauthorized" });
  }
  try {
    const totalSpendings = await EXPENSE.totalSpendings(userId);
    return res.status(200).json({ totalSpendings });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "internal server error" });
  }
};
export const getMonthlySpendings = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { year, month } = req.query;
  if (!userId) {
    return res.status(401).json({ message: "unauthorized" });
  }
  try {
    const monthlySpendings = await EXPENSE.monthlySpendings(
      userId,
      parseInt(year as string),
      parseInt(month as string),
    );
    return res.status(200).json({ monthlySpendings });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "internal server error" });
  }
};
export const getExpenses = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { page, limit } = req.query;
  if (!userId) {
    return res.status(401).json({ message: "unauthorized" });
  }
  try {
    const expenses = await EXPENSE.getExpenses(
      userId,
      parseInt(page as string),
      parseInt(limit as string),
    );
    return res.status(200).json({ expenses });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "internal server error" });
  }
};
export const getHighestSpendings = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ message: "unauthorized" });
  }
  try {
    const highestSpendings = await EXPENSE.getHighestSpendings(userId);
    return res.status(200).json({ highestSpendings });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "internal server error" });
  }
};
export const getCategorywiseSpendings = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ message: "unauthorized" });
  }
  try {
    const averageSpendingByCategory =
      await EXPENSE.averageSpendingByCategory(userId);
    return res.status(200).json({ averageSpendingByCategory });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "internal server error" });
  }
};

export const uploadReceipt = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ message: "unauthorized" });
  }
  try {
    const receipt = await EXPENSE.uploadReceipt(
      userId,
      req.file?.path as string,
    );
    const absolutePath = path.resolve(req.file?.path as string);
    const authHeader = req.headers.authorization;
    const userJwtToken = authHeader?.split(" ")[1];
    // adding to que
    const job = await recieptQue.add(
      "processReceipt",
      {
        receiptId: receipt._id,
        jwt: userJwtToken,
        imagePath: absolutePath,
      },
      {
        attempts: 2,
      },
    );
    if (!job || !job.id)
      return res.status(400).json({ message: "error adding reciept to job" });

    return res.status(200).json({ receipt });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "internal server error" });
  }
};
