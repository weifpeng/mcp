import { VersionedTransaction } from "@solana/web3.js";
import { arrayBufferToHex } from "tp-mcp-wallet/src/encrypt";

const solana = globalThis.window?.tokenpocket?.solana;

export const request = async (
  chainId: string,
  param: {
    method: string;
    data: any;
  },
) => {
  const { method, data } = param;

  if (method === "connect") {
    return await solana?.connect();
  }

  if (method === "disconnect") {
    return await solana?.disconnect();
  }

  if (method === "signMessage") {
    const signedData = await solana?.signMessage(
      new TextEncoder().encode(data),
    );

    if (!signedData?.signature) return "";

    return {
      ...signedData,
      signature: arrayBufferToHex(signedData?.signature.buffer as ArrayBuffer),
    };
  }

  if (method === "signTransaction") {
    const transaction = VersionedTransaction.deserialize(
      Buffer.from(data, "hex"),
    );

    const signedData = await solana?.signTransaction(transaction);

    if (!signedData) return "";

    return Buffer.from(signedData.serialize()).toString("hex");
  }

  if (method === "signAllTransactions") {
    const transactions = data.map((t: any) =>
      VersionedTransaction.deserialize(Buffer.from(t, "hex")),
    );

    return await solana?.signAllTransactions(transactions);
  }
};
