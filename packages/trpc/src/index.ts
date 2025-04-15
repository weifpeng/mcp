import { verifySignature } from "@mcp/solana";
import * as trpcExpress from "@trpc/server/adapters/express";
import type { RequestHandler } from "express";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { getGlobalData, setGlobalData } from "./provider";
import { getSolanaSdk } from "./provider/solana-sdk";
import { signDataSchema } from "./provider/storage/type";
import { createCallerFactory, publicProcedure, router } from "./trpc";

export const appRouter = router({
  initWallet: publicProcedure
    .input(
      z.object({
        network: z.enum(["solana", "ethereum"]),
        address: z.string(),
        signature: z.string(),
        message: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const isValid = await verifySignature({
        signature: input.signature,
        message: input.message,
        address: input.address,
      });

      if (!isValid) {
        throw new Error("Invalid signature");
      }

      await setGlobalData({
        addressData: [
          {
            address: input.address,
            signature: input.signature,
            message: input.message,
            network: input.network,
          },
        ],
      });

      return input.address;
    }),

  getWallet: publicProcedure
    .input(
      z.object({
        network: z.enum(["solana", "ethereum"]),
      }),
    )
    .query(async ({ input }) => {
      const data = await getGlobalData();
      return data.addressData.find(
        (addressData) => addressData.network === input.network,
      );
    }),

  addSignData: publicProcedure
    .input(
      signDataSchema.pick({
        address: true,
        dataHex: true,
        type: true,
        network: true,
      }),
    )
    .mutation(async ({ input }) => {
      const id = uuidv4();

      await setGlobalData({
        signData: [
          {
            id,
            address: input.address,
            dataHex: input.dataHex,
            type: input.type,
            network: input.network,
            signedDataHex: "",
          },
        ],
      });

      return id;
    }),

  submitSignedData: publicProcedure
    .input(
      signDataSchema
        .pick({
          id: true,
          signedDataHex: true,
        })
        .merge(
          z.object({
            txHash: z.string().nullish(),
          }),
        ),
    )
    .mutation(async ({ input }) => {
      const data = await getGlobalData();

      const item = data.signData.find((signData) => signData.id === input.id);

      if (!item) {
        throw new Error("Sign data not found");
      }

      await setGlobalData({
        signData: [
          {
            ...item,
            id: input.id,
            signedDataHex: input.signedDataHex,
            txHash: input.txHash,
          },
        ],
      });

      return input.signedDataHex;
    }),

  getSignData: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const data = await getGlobalData();
      return data.signData.find((signData) => signData.id === input.id);
    }),

  sendTransaction: publicProcedure
    .input(
      z.object({
        signedDataHex: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const txHash = await getSolanaSdk().sendTransaction({
        versionedTransactionHex: input.signedDataHex,
      });

      return txHash;
    }),
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;

export const trpcExpressMiddleware: RequestHandler =
  trpcExpress.createExpressMiddleware<AppRouter>({
    router: appRouter,
    createContext: () => ({}),
  });

export const createCaller = createCallerFactory(appRouter);
