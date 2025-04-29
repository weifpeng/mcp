import * as trpcExpress from "@trpc/server/adapters/express";
import type { RequestHandler } from "express";
import { z } from "zod";
import {
  createCallerFactory,
  publicProcedure,
  router
} from "./trpc";

import {
  messageDataTable,
  type MessageDataType,
} from "@tokenpocket/database/src/db/schema";
import { and, eq, gt } from "drizzle-orm";
import { jwtVerify } from "jose";
import { config } from "./config";
import { db } from "./provider/storage/database";
import { redisStorage } from "./provider/storage/redis";

const messageSendSchema = z.object({
  id: z.string().nullish(),
  topic: z.string(),
  address: z.string().nullish(),
  chainId: z.string(),
  method: z.string(),
  req: z.string(),
  res: z.string().nullish(),
  error: z.string().nullish(),
  status: z.enum(["pending", "success", "error"]).default("pending"),
})

export const appRouter = router({
  message: {
    send: publicProcedure
      .input(messageSendSchema)
      .mutation(async ({ input, ctx }) => {
        if (!input.id) {
          const { id, ...rest } = input
          const result = await db
            .insert(messageDataTable)
            .values(rest)
            .returning();
          await redisStorage.setTopicIp(input.topic, ctx.ip || "unknown");
          return result[0]?.id;
        }

        const res = z.string().parse(input.res);
        const status = z.enum(["pending", "success", "error"]).parse(input.status);
        const error = z.string().nullish().parse(input.error);
        await db
          .update(messageDataTable)
          .set({
            res,
            status,
            error,
          })
          .where(eq(messageDataTable.id, input.id));

        return input.id;
      }),
    listen: publicProcedure
      .input(
        z.object({
          id: z.string().nullish(),
          topic: z.string(),
          timestamp: z.number().default(0),
        }),
      )
      .query(async ({ input }) => {
        if (!input.id) {
          await redisStorage.setActiveConn(input.topic);
        }
        let data: MessageDataType[] = []
        let count = 0
        do {
          count++

          const messageData = await db
            .select()
            .from(messageDataTable)
            .where(
              and(
                eq(messageDataTable.topic, input.topic),
                gt(messageDataTable.createdAt, new Date(input.timestamp + 1)),
                ...(input.id ? [eq(messageDataTable.id, input.id)] : []),
              ),
            );

          if (input.id) {
            data = messageData.filter(m => Boolean(m.res))
          } else {
            data = messageData
          }

          await new Promise(resolve => setTimeout(resolve, 1000))
        } while (data.length === 0 && count < 30)
        return data;
      }),
  },
  conn: {
    info: publicProcedure.input(z.object({ topic: z.string() })).query(async ({ input, ctx }) => {
      const ip = await redisStorage.getTopicIp(input.topic)
      return { topicIp: ip, clientIp: ctx.ip }
    }),
    isActive: publicProcedure
      .input(z.object({ topic: z.string() }))
      .query(async ({ input }) => {
        const activeConn = await redisStorage.getActiveConn(input.topic);
        return activeConn
      }),
  },
});

export type AppRouter = typeof appRouter;

export const createContext = async (token?: string | null, ip?: string | null) => {
  if (!token) {
    return { uuid: null, ip };
  }
  try {
    const data = await jwtVerify(
      token,
      new TextEncoder().encode(config.jwtSecret),
    );
    if (data.payload.exp && data.payload.exp < Date.now() / 1000) {
      throw new Error("Unauthorized");
    }
    return { uuid: data.payload.uuid as string, ip };
  } catch (e) {
    return { uuid: null, ip };
  }
};

export const trpcExpressMiddleware: RequestHandler =
  trpcExpress.createExpressMiddleware<AppRouter>({
    router: appRouter,
    createContext: () => ({}),
  });

export const createCaller = createCallerFactory(appRouter);
