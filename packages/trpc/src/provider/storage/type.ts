import { z } from "zod";

export const signDataSchema = z.object({
  id: z.string(),
  address: z.string().nullish(),
  dataHex: z.string(),
  signedDataHex: z.string().nullish(),
  type: z.enum(["transaction", "message"]),
  txHash: z.string().nullish(),
  network: z.enum(["solana", "ethereum"]),
});

export const globalDataSchema = z.object({
  addressData: z.array(
    z.object({
      address: z.string(),
      signature: z.string(),
      message: z.string(),
      network: z.enum(["solana", "ethereum"]),
    }),
  ),
  signData: z.array(signDataSchema),
});

export interface IStorage {
  setGlobalData: (
    data: Partial<z.infer<typeof globalDataSchema>>,
  ) => Promise<void>;
  getGlobalData: () => Promise<z.infer<typeof globalDataSchema>>;
}
