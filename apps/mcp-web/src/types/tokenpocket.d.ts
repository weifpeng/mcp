import type { PublicKey, VersionedTransaction } from "@solana/web3.js";

interface TokenPocketSolana {
  signMessage(message: Uint8Array): Promise<{
    publicKey: PublicKey;
    signature: Uint8Array;
  }>;
  getAccount(): Promise<string>;
  connect(): Promise<void>;
  isConnected: boolean;
  signTransaction(
    transaction: VersionedTransaction,
  ): Promise<VersionedTransaction>;
}

interface TokenPocket {
  solana: TokenPocketSolana;
}

declare global {
  interface Window {
    tokenpocket: TokenPocket | undefined;
  }
}

export {};
