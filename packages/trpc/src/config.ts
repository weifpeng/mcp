import { z } from "zod";

export const ConfigSchema = z.object({
    heliusApiKey: z.string(),
    rpcUrl: z.string()
});

export const config = ConfigSchema.parse({
    heliusApiKey: process.env.HELIUS_API_KEY,
    rpcUrl: process.env.RPC_URL
})

