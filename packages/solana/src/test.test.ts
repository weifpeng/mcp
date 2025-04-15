import {
  createAccount,
  getMint,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import "dotenv/config";
import {
  Connection,
  Transaction,
  TransactionMessage,
  VersionedMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { z } from "zod";

import { expect, test } from "vitest";
import { Keypair, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";
import { SolanaSDK } from ".";
import { Decimal } from "@nemo-rewards/lib/decimal";

const testConfigSchema = z.object({
  RPC_URL: z.string(),
  PRIVATE_KEY: z.string(),
});

const testConfig = testConfigSchema.parse(process.env);

test("test", { timeout: 1000 * 60 }, async () => {
  const solana = new SolanaSDK({
    rpcUrl: testConfig.RPC_URL,
  });

  const tokenAddress = "FncizudA94jN5VgFru9rB1YaeTiqstdJyUn7JZUhVmzH";
  const userAddress = "6xbu6TqgwcUZkXgTcZqHF2oTNU7hk4iCZbTNKUPEdTpY";

  const instruction = solana.buildCloseTokenAccountInstruction({
    account: new PublicKey(tokenAddress),
    tokenAddress: new PublicKey(tokenAddress),
    destination: new PublicKey(userAddress),
  });

  const latestBlockhash = await solana.connection.getLatestBlockhash();

  const tx = new TransactionMessage({
    payerKey: new PublicKey(userAddress),
    recentBlockhash: latestBlockhash.blockhash,
    instructions: [...instruction],
  }).compileToV0Message([]);

  const versionedTx = new VersionedTransaction(tx);

  const txData = Buffer.from(versionedTx.serialize()).toString("hex");

  console.log(txData);
});
