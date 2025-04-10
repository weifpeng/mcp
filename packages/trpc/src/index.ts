import { router, publicProcedure, createCallerFactory } from './trpc';
import * as trpcExpress from '@trpc/server/adapters/express';
import { RequestHandler } from 'express';
import { getGlobalData, setGlobalData } from './provider';
import { z } from 'zod';
import { solanaSdk } from './provider';
import { Decimal } from 'decimal.js';
import { getSolanaSdk } from './provider/solana-sdk';

export const appRouter = router({

    isInitSolanaWallet: publicProcedure.query(() => {
        return getGlobalData().privateKey !== '';
    }),

    initSolanaWallet: publicProcedure.input(z.object({
        password: z.string(),
    })).mutation(async ({ input }) => {
        const { address, secretKey } = await solanaSdk.generateKeypair();

        setGlobalData({
            ...getGlobalData(),
            privateKey: secretKey,
            password: input.password,
        })

        return address
    }),

    getSolanaWallet: publicProcedure.query(() => {
        const keypair = solanaSdk.getKeypair(getGlobalData().privateKey);

        return {
            address: keypair.publicKey.toBase58(),
        }
    }),

    getSolanaBalance: publicProcedure.query(async () => {
        const keypair = await solanaSdk.getKeypair(getGlobalData().privateKey);

        const balance = await solanaSdk.getSolBalance(keypair.publicKey.toBase58())

        return balance
    }),

    createToken: publicProcedure.input(z.object({
        name: z.string(),
        imageUrl: z.string(),
        symbol: z.string(),
        decimals: z.number(),
        initialSupply: z.number(),
    })).mutation(async ({ input }) => {
        const keypair = await solanaSdk.getKeypair(getGlobalData().privateKey);

        const result = await solanaSdk.createToken({
            from: keypair,
            name: input.name,
            imageUrl: input.imageUrl,
            symbol: input.symbol,
            decimals: input.decimals,
            initialSupply: input.initialSupply
        })

        return result

    }),


    listSplToken: publicProcedure.input(z.object({
        address: z.string()
    })).query(async ({ input }) => {

        const result = await solanaSdk.getAddressTokenList(input.address)
        const tokenList = await Promise.all(result.map(async (token) => {
            const tokenBalance = await solanaSdk.getTokenAccountBalance(token)

            const tokenInfo = await solanaSdk.getTokenInfo(tokenBalance.mint.toBase58())

            return {
                ...tokenInfo,
                formattedBalance: new Decimal(tokenBalance.amount.toString()).div(10 ** tokenInfo?.decimals).toString(),
                tokenAddress: tokenBalance.mint.toBase58()
            }
        }))

        return tokenList
    }),

    transferSplToken: publicProcedure.input(z.object({
        toAddress: z.string(),
        tokenAddress: z.string(),
        amount: z.number(),
    })).mutation(async ({ input }) => {
        const keypair = await solanaSdk.getKeypair(getGlobalData().privateKey);

        const result = await getSolanaSdk().sendToken({
            from: keypair,
            to: input.toAddress,
            amount: new Decimal(input.amount).toString(),
            tokenAddress: input.tokenAddress,
        })

        return result
    }),


    hello: publicProcedure.query(() => {
        return "Hello, world!"
    }),
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;

export const trpcExpressMiddleware: RequestHandler = trpcExpress.createExpressMiddleware<AppRouter>({
    router: appRouter,
    createContext: () => ({}),
});


export const createCaller = createCallerFactory(appRouter);