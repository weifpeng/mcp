import { z } from "zod";

export const configSchema = z.object({
  TP_MCP_WALLET_URL: z.string().url().default("https://mcp.tp.xyz"),
});

export const config = configSchema.parse(process.env);
