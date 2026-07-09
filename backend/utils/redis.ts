import ioredis from "ioredis";
export const connection = new ioredis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  maxRetriesPerRequest: null
});
