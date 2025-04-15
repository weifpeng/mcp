import "dotenv/config";
import { signMessage } from "@mcp/solana";
import { VersionedTransaction } from "@solana/web3.js";
import { describe, expect, test } from "vitest";
import { createCaller } from "../src";
import { appRouter } from "../src/index";
import { solanaSdk } from "../src/provider/solana-sdk";

// const keypair = await solanaSdk.generateKeypair();
const keypair = solanaSdk.getKeypair(process.env.PRIVATE_KEY!);

const caller = createCaller(appRouter);
const SING_MESSAGE = "test";
const SIGNED_MESSAGE_HEX = Buffer.from(
  signMessage(keypair.secretKey, SING_MESSAGE),
).toString("hex");

describe.sequential("test wallet trpc", () => {
  test("test sign message", async () => {
    const data = await caller.getWallet({
      network: "solana",
    });

    expect(data === undefined).toBe(true);

    const initResult = await caller.initWallet({
      network: "solana",
      address: keypair.address,
      message: SING_MESSAGE,
      signature: SIGNED_MESSAGE_HEX,
    });

    expect(initResult === keypair.address).toBe(true);

    const afterInitWalletData = await caller.getWallet({
      network: "solana",
    });

    expect(afterInitWalletData?.address === keypair.address).toBe(true);

    const signResultId = await caller.addSignData({
      network: "solana",
      type: "message",
      dataHex: Buffer.from(SING_MESSAGE).toString("hex"),
    });

    expect(signResultId).toBeDefined();

    const querySign = await caller.getSignData({
      id: signResultId,
    });

    expect(querySign?.id === signResultId).toBe(true);

    const submitSignedResult = await caller.submitSignedData({
      id: signResultId,
      signedDataHex: SIGNED_MESSAGE_HEX,
    });

    expect(submitSignedResult).toBeDefined();

    const querySignedData = await caller.getSignData({
      id: signResultId,
    });

    expect(querySignedData?.signedDataHex === SIGNED_MESSAGE_HEX).toBe(true);
  });

  test.only("test sign transaction", async () => {
    const data = await caller.getWallet({
      network: "solana",
    });

    expect(data === undefined).toBe(true);
    const receiver = await solanaSdk.generateKeypair();

    const instruction = await solanaSdk.buildSendSolTransactionInstruction({
      from: keypair.publicKey.toBase58(),
      to: keypair.publicKey.toBase58(), // 自己转自己
      amount: "1000000",
    });

    const blockhash = await solanaSdk.connection.getLatestBlockhash();

    const transaction = await solanaSdk.buildTransaction({
      instructions: [...instruction],
      addressLookupTableAddresses: [],
      blockhash: blockhash.blockhash,
      feePayer: keypair.publicKey,
    });

    const signResultId = await caller.addSignData({
      network: "solana",
      type: "transaction",
      dataHex: Buffer.from(transaction.serialize()).toString("hex"),
    });

    expect(signResultId).toBeDefined();

    const querySign = await caller.getSignData({
      id: signResultId,
    });

    expect(querySign?.dataHex).toBeDefined();

    const versionedTransaction = VersionedTransaction.deserialize(
      Buffer.from(querySign?.dataHex!, "hex"),
    );

    versionedTransaction.sign([keypair]);

    await caller.submitSignedData({
      id: signResultId,
      signedDataHex: Buffer.from(versionedTransaction.serialize()).toString(
        "hex",
      ),
    });

    const querySignedData = await caller.getSignData({
      id: signResultId!,
    });

    expect(querySignedData?.signedDataHex).toBeDefined();

    const tx = await solanaSdk.sendTransaction({
      versionedTransactionHex: querySignedData?.signedDataHex!,
    });

    expect(tx).toBeDefined();
  });
});
