import { z } from "zod";

export const ConfigSchema = z.object({
    rpcUrl: z.string(),
    dataFilePath: z.string().nullish()
});

export const config = ConfigSchema.parse({
    rpcUrl: process.env.RPC_URL,
    dataFilePath: process.env.DATA_FILE_PATH
})

