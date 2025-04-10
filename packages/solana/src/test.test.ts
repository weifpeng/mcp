import { createAccount, getMint, TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import "dotenv/config";
import { Connection } from '@solana/web3.js';
import { z } from "zod";

import { expect, test } from "vitest";
import { Keypair, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";
import { SolanaSDK } from '.';
import { Decimal } from '@nemo-rewards/lib/decimal';

const testConfigSchema = z.object({
  RPC_URL: z.string(),
  PRIVATE_KEY: z.string(),
});

const testConfig = testConfigSchema.parse(process.env);

test("test", { timeout: 1000 * 60 }, async () => {

  const solana = new SolanaSDK({
    rpcUrl: testConfig.RPC_URL,
    privateKey: testConfig.PRIVATE_KEY,
  });

  const key=Keypair.fromSecretKey(bs58.decode(testConfig.PRIVATE_KEY))

  const result = await solana.buildTokenSwapTransactionInstruction({
    from: Keypair.generate().publicKey.toString(),
    to: "FncizudA94jN5VgFru9rB1YaeTiqstdJyUn7JZUhVmzH",
    amount: new Decimal(1 * 10 ** 6).toString(),
    inputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    outputMint: "So11111111111111111111111111111111111111112",
  });




  console.log(result);
});
