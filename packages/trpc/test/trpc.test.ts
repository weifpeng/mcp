import "dotenv/config";
import { signMessage } from "@mcp/solana";
import { VersionedTransaction } from "@solana/web3.js";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { v4 as uuidv4 } from "uuid";
import { describe, expect, test } from "vitest";
import type { AppRouter } from "../src";
import { solanaSdk } from "../src/provider/solana-sdk";
import { decodeJwt } from "jose";

// const keypair = await solanaSdk.generateKeypair();
const keypair = solanaSdk.getKeypair(process.env.PRIVATE_KEY!);

const SING_MESSAGE = "test";
const SIGNED_MESSAGE_HEX = Buffer.from(
  signMessage(keypair.secretKey, SING_MESSAGE),
).toString("hex");

describe.sequential("test wallet trpc", () => {
  const uuid = uuidv4();
  let token: string | null = null;
  const client = createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: "http://localhost:3000/trpc",
        headers() {
          return {
            authorization: `${token}`,
          };
        },
      }),
    ],
  });

  test.only("connect wallet", async () => {
    const result = await client.connect.mutate({
      uuid,
      signature: SIGNED_MESSAGE_HEX,
      message: SING_MESSAGE,
      wallet: {
        address: keypair.publicKey.toBase58(),
        network: "solana",
        chainId: "1",
      },
    });

    console.log(result);

    token = await client.connect.mutate({ uuid });
    console.log(token);

    expect(token).toBeDefined();

    const payload = await decodeJwt(token);
    console.log(payload);

    const currentWallet = await client.getWallet.query();
    expect(currentWallet?.address).toBe(keypair.publicKey.toBase58());
  });

  test("test sign message", async () => {
    const signResultId = await client.addSignData.mutate({
      address: keypair.publicKey.toBase58(),
      network: "solana",
      type: "message",
      dataHex: Buffer.from(SING_MESSAGE).toString("hex"),
    });

    expect(signResultId).toBeDefined();

    const querySign = await client.getSignData.query({
      id: signResultId!,
    });

    expect(querySign?.id === signResultId).toBe(true);

    await client.submitSignedData.mutate({
      id: signResultId!,
      signedDataHex: SIGNED_MESSAGE_HEX,
    });

    const querySignedData = await client.getSignData.query({
      id: signResultId!,
    });

    expect(querySignedData?.signedDataHex === SIGNED_MESSAGE_HEX).toBe(true);
  });

  test("test sign transaction", async () => {
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

    const signResultId = await client.addSignData.mutate({
      address: keypair.publicKey.toBase58(),
      network: "solana",
      type: "transaction",
      dataHex: Buffer.from(transaction.serialize()).toString("hex"),
    });

    expect(signResultId).toBeDefined();

    const querySign = await client.getSignData.query({
      id: signResultId!,
    });

    expect(querySign?.dataHex).toBeDefined();

    const versionedTransaction = VersionedTransaction.deserialize(
      Buffer.from(querySign?.dataHex!, "hex"),
    );

    versionedTransaction.sign([keypair]);

    await client.submitSignedData.mutate({
      id: signResultId!,
      signedDataHex: Buffer.from(versionedTransaction.serialize()).toString(
        "hex",
      ),
    });

    const querySignedData = await client.getSignData.query({
      id: signResultId!,
    });

    expect(querySignedData?.signedDataHex).toBeDefined();

    const tx = await solanaSdk.sendTransaction({
      versionedTransactionHex: querySignedData?.signedDataHex!,
    });

    expect(tx).toBeDefined();
  });
});
