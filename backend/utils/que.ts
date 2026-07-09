import { Queue } from "bullmq";
import { connection } from "./redis";
export const recieptQue = new Queue("receipt-processing", {
  connection: connection as any,
});
