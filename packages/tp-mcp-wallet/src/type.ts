import { z } from "zod";
import type { EIP1193Parameters } from "viem";

export type EVMTransportData = EIP1193Parameters;

export type ITransportData = z.infer<typeof ITransportDataSchema>;

export const ITransportDataSchema = z.object({
  network: z.enum(["evm", "svm", "tvm"]),
  chainId: z.string().or(z.number()),
  data: z.any(),
});
