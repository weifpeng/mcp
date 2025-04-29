import { VersionedTransaction } from "@solana/web3.js";

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
    return await solana?.signMessage(data);
  }

  if (method === "signTransaction") {
    const transaction = VersionedTransaction.deserialize(data);

    return await solana?.signTransaction(transaction);
  }

  if (method === "signAllTransactions") {
    const transactions = data.map((t: any) =>
      VersionedTransaction.deserialize(t),
    );

    return await solana?.signAllTransactions(transactions);
  }
};
