import "dotenv/config";
import * as nacl from "tweetnacl";
import { z } from "zod";
import { SolanaSDK, buildConnectMessage, verifySignature } from "./index.js";

import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import { expect, test } from "vitest";

const testConfigSchema = z.object({
  RPC_URL: z.string(),
  PRIVATE_KEY: z.string(),
  HELIUS_API_KEY: z.string(),
  USDC_ADDRESS: z.string(),
});

const testConfig = testConfigSchema.parse(process.env);

const TOKEN_ADDRESS = "AfVVmY8N9kjwCQnV4yFRBYMJvFNb2W6dBfwNN1vUXP7r";

test("verify signature", { timeout: 1000 * 60 * 10 }, async () => {
  const adminPayer = Keypair.fromSecretKey(
    new Uint8Array(bs58.decode(testConfig.PRIVATE_KEY)),
  );
  const message = await buildConnectMessage({
    account: adminPayer.publicKey.toBase58(),
    domain: "test",
    statement: "test",
  });

  const messageBytes = new TextEncoder().encode(message);
  const signature = nacl.sign.detached(messageBytes, adminPayer.secretKey);

  const isValid = await verifySignature({
    signature: Buffer.from(signature).toString("hex"),
    message,
    address: adminPayer.publicKey.toBase58(),
  });

  expect(isValid).toBe(true);
});

test("create token instruction", { timeout: 1000 * 60 * 10 }, async () => {
  const solana = new SolanaSDK({
    rpcUrl: testConfig.RPC_URL,
  });

  const adminPayer = Keypair.fromSecretKey(
    new Uint8Array(bs58.decode(testConfig.PRIVATE_KEY)),
  );

  const instruction = await solana.buildCreateMintTransactionInstruction({
    from: adminPayer.publicKey,
    name: "test",
    symbol: "test",
    decimals: 6,
  });

  const latestBlockhash = await solana.connection.getLatestBlockhash();

  const tx = solana.buildTransaction({
    instructions: [...instruction],
    addressLookupTableAddresses: [],
    blockhash: latestBlockhash.blockhash,
    feePayer: adminPayer.publicKey,
  });

  tx.sign([adminPayer]);

  const serializedTx = tx.serialize();

  console.log(serializedTx);
});

test("create token", { timeout: 1000 * 60 * 10 }, async () => {
  const solana = new SolanaSDK({
    rpcUrl: testConfig.RPC_URL,
  });

  const adminPayer = Keypair.fromSecretKey(
    new Uint8Array(bs58.decode(testConfig.PRIVATE_KEY)),
  );

  const tokenInfo = await solana.createToken({
    from: adminPayer,
    name: "test",
    symbol: "test",
    decimals: 6,
    initialSupply: 1000000,
    imageUrl:
      "https://storage.googleapis.com/storage.catbird.ai/predictions/257313940344803328/71e8c58f-988d-4455-bcb5-d1d15a4d55f9.png",
  });

  console.log(tokenInfo);
});
