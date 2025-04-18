import { verifySignature } from "@tokenpocket/solana";
import * as trpcExpress from "@trpc/server/adapters/express";
import type { RequestHandler } from "express";
import { z } from "zod";
import { getSolanaSdk } from "./provider/solana-sdk";
import {
  createCallerFactory,
  protectedProcedure,
  publicProcedure,
  router,
} from "./trpc";

import { db } from "./provider/storage/database";
import { and, desc, eq, isNull, not } from "drizzle-orm";
import {
  signDataInsertSchema,
  signDataSelectSchema,
  signDataTable,
} from "@tokenpocket/database/src/db/schema";
import { jwtVerify, SignJWT } from "jose";
import { config } from "./config";
import { redisStorage, walletSchema } from "./provider/storage/redis";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  test: publicProcedure.mutation(async ({ input }) => {
    return { test: "hello" };
  }),
  connect: publicProcedure
    .input(
      z.object({
        uuid: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      console.log("connect", input);
      const token = await redisStorage.getToken(input.uuid);
      console.log("token", token);
      return token;
    }),

  signIn: publicProcedure
    .input(
      z.object({
        uuid: z.string().nullish(),
        message: z.string(),
        signature: z.string(),
        wallet: walletSchema,
      }),
    )
    .mutation(async ({ input }) => {
      const isValid = await verifySignature({
        signature: input.signature,
        message: input.message,
        address: input.wallet.address,
      });

      if (!isValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid signature",
        });
      }

      const token = await new SignJWT({
        uuid: input.uuid,
        address: input.wallet.address,
        role: "DAPP",
      })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("1w")
        .sign(new TextEncoder().encode(config.jwtSecret));
      if (input.uuid) {
        const token = await new SignJWT({
          uuid: input.uuid,
          address: input.wallet.address,
          role: "MCP",
        })
          .setProtectedHeader({ alg: "HS256" })
          .setExpirationTime("24h")
          .sign(new TextEncoder().encode(config.jwtSecret));

        await redisStorage.setToken(input.uuid, token);
        await redisStorage.setCurrentWallet(input.uuid, input.wallet);
      }

      return token;
    }),
  getWallet: protectedProcedure.query(async ({ input, ctx }) => {
    const wallet = await redisStorage.getCurrentWallet(ctx.uuid);
    return wallet;
  }),

  addSignData: protectedProcedure
    .input(
      signDataInsertSchema.pick({
        address: true,
        dataHex: true,
        type: true,
        network: true,
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const currentWallet = await redisStorage.getCurrentWallet(ctx.uuid);

      if (!currentWallet) {
        throw new Error("Wallet not found");
      }
      const data = await db
        .insert(signDataTable)
        .values({
          ...input,
          createdBy: ctx.uuid,
        })
        .returning();
      return data[0]?.id;
    }),

  submitSignedData: protectedProcedure
    .input(
      signDataInsertSchema
        .required()
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
    .mutation(async ({ input, ctx }) => {
      const signDataArr = await db
        .select()
        .from(signDataTable)
        .where(eq(signDataTable.id, input.id));
      const signData = signDataArr[0];

      if (signData?.createdBy !== ctx.uuid) {
        throw new Error("uuid not match");
      }

      await db
        .update(signDataTable)
        .set({
          signedDataHex: input.signedDataHex,
          txHash: input.txHash,
          updatedBy: ctx.uuid,
        })
        .where(eq(signDataTable.id, signData.id));
    }),

  getSignData: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .output(
      signDataSelectSchema
        .pick({
          id: true,
          address: true,
          dataHex: true,
          network: true,
          type: true,
          txHash: true,
          createdAt: true,
          signedDataHex: true,
        })
        .nullable(),
    )
    .query(async ({ input, ctx }) => {
      const signDataArr = await db
        .select()
        .from(signDataTable)
        .where(eq(signDataTable.id, input.id));
      const signData = signDataArr[0];

      if (signData?.createdBy !== ctx.uuid) {
        return null;
      }

      return signData;
    }),

  getSignDataList: protectedProcedure
    .input(
      z.object({
        isSigned: z.boolean().nullish(),
      }),
    )
    .output(
      z.array(
        signDataSelectSchema.pick({
          id: true,
          address: true,
          dataHex: true,
          createdAt: true,
          type: true,
          network: true,
          signedDataHex: true,
        }),
      ),
    )
    .query(async ({ input, ctx }) => {
      const signDataArr = await db
        .select()
        .from(signDataTable)
        .where(
          and(
            eq(signDataTable.createdBy, ctx.uuid),
            input.isSigned
              ? not(isNull(signDataTable.signedDataHex))
              : isNull(signDataTable.signedDataHex),
          ),
        )
        .orderBy(desc(signDataTable.createdAt));

      return signDataArr;
    }),

  sendTransaction: protectedProcedure
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

export const createContext = async (token?: string | null) => {
  if (!token) {
    return { uuid: null };
  }
  try {
    const data = await jwtVerify(
      token,
      new TextEncoder().encode(config.jwtSecret),
    );
    if (data.payload.exp && data.payload.exp < Date.now() / 1000) {
      throw new Error("Unauthorized");
    }
    return { uuid: data.payload.uuid as string };
  } catch (e) {
    console.log(e);
    return { uuid: null };
  }
};

export const trpcExpressMiddleware: RequestHandler =
  trpcExpress.createExpressMiddleware<AppRouter>({
    router: appRouter,
    createContext: () => ({}),
  });

export const createCaller = createCallerFactory(appRouter);
