// Express entry point placeholder
import express from "express";
import cors from "cors";
import path from "path";
import { connectDb } from "./db/db";
import userRouter from "./routes/user"
import expenseRouter from "./routes/expense"
const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.resolve(__dirname, "uploads")));
app.use("/user", userRouter);
app.use("/api", expenseRouter);
app.get("/", (req, res) => {
  res.send("server is running");
})

app.listen(process.env.PORT || 5000, async () => {
  await connectDb();
  console.log(`Server started on port ${process.env.PORT}`);
})