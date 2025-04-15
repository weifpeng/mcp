import {
  TransactionMessage,
  VersionedTransaction
} from "@solana/web3.js";
import "dotenv/config";
import { z } from "zod";

import { PublicKey } from "@solana/web3.js";
import { test } from "vitest";
import { SolanaSDK } from ".";

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
