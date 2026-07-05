import express from "express"
import { verifyUser } from "../middleware/authenticate";
import { expenseformVerify } from "../middleware/inputVerify";
import { addExpenseThroughform, getTotalSpendings, getMonthlySpendings, getExpenses, getHighestSpendings, getCategorywiseSpendings } from "../controller/expense";
const router = express.Router();
router.post("/expense", verifyUser, expenseformVerify, addExpenseThroughform);
router.get("/total", verifyUser, getTotalSpendings);
router.get("/monthly", verifyUser, getMonthlySpendings);
router.get("/expenses", verifyUser, getExpenses);
router.get("/highest", verifyUser, getHighestSpendings);
router.get("/categorywise", verifyUser, getCategorywiseSpendings);
export default router;