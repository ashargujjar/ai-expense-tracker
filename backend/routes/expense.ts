import express from "express"
import { verifyUser } from "../middleware/authenticate";
import { expenseformVerify } from "../middleware/inputVerify";
import { addExpenseThroughform, getTotalSpendings, getMonthlySpendings, getExpenses, getHighestSpendings, getCategorywiseSpendings, uploadReceipt } from "../controller/expense";
import { upload } from "../utils/multer";
const router = express.Router();
router.post("/expense", verifyUser, expenseformVerify, addExpenseThroughform);
router.get("/total", verifyUser, getTotalSpendings);
router.get("/monthly", verifyUser, getMonthlySpendings);
router.get("/expenses", verifyUser, getExpenses);
router.get("/highest", verifyUser, getHighestSpendings);
router.get("/categorywise", verifyUser, getCategorywiseSpendings);
router.post("/upload-receipt", verifyUser, upload.single("image"), uploadReceipt);
export default router;