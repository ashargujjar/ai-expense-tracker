import express from "express";
import { login, signUp } from "../controller/user";
import { validateLogin, validatesigup } from "../middleware/inputVerify";
const router = express.Router();
router.post("/login", validateLogin, login);
router.post("/signup", validatesigup, signUp);
export default router;