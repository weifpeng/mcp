import type { PublicKey, VersionedTransaction } from "@solana/web3.js";
import type { TronWeb } from "@tronweb3/tronwallet-abstract-adapter";

interface TokenPocketSolanaWallet {
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
  signAllTransactions(
    transactions: VersionedTransaction[],
  ): Promise<VersionedTransaction[]>;
  disconnect(): Promise<void>;
}

interface TokenPocketEvmWallet {
  request(params: { method: string }): Promise<any>;
}

interface TokenPocket {
  solana: TokenPocketSolanaWallet;
  ethereum: TokenPocketEvmWallet;
  tronWeb: TronWeb;
  tron: {
    request(params: { method: string }): Promise<any>;
  };
}

declare global {
  interface Window {
    tokenpocket: TokenPocket | undefined;
  }
}

export {};
