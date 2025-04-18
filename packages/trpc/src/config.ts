import { z } from "zod";

export const ConfigSchema = z.object({
  rpcUrl: z.string(),
  redisUrl: z.string(),
  redisToken: z.string(),
  jwtSecret: z.string(),
  databaseUrl: z.string(),
});

export const config = ConfigSchema.parse({
  rpcUrl: process.env.RPC_URL,
  redisUrl: process.env.UPSTASH_REDIS_URL,
  redisToken: process.env.UPSTASH_REDIS_TOKEN,
  jwtSecret: process.env.JWT_SECRET,
  databaseUrl: process.env.DATABASE_URL,
});
