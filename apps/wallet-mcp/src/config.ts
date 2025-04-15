import "dotenv/config";
import { z } from "zod";

export const configSchema = z.object({
  BASE_URL: z.string().default("http://localhost:3000"),
  RPC_URL: z.string().default("https://api.devnet.solana.com"),
  DATA_FILE_PATH: z.string().nullish(),
});

export const config = configSchema.parse(process.env);
