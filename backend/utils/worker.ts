import { Worker } from "bullmq";
import { connection } from "./redis";
import axios from "axios";
const worker = new Worker(
  "receipt-processing",
  async (job) => {
    const { receiptId, jwt, imagePath } = job.data;
    const response = await axios.post(`${process.env.PYTHON_URL}/ocr`, {
      receiptId,
      jwt,
      imagePath,
    });

    console.log(response.data);
  },
  {
    connection: connection as any,
  },
);
