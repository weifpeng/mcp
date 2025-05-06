import type {
  SupportedTransactionVersions,
  TransactionOrVersionedTransaction,
  WalletName,
} from "@solana/wallet-adapter-base";
import {
  BaseMessageSignerWalletAdapter,
  WalletDisconnectionError,
  WalletNotConnectedError,
  WalletNotReadyError,
  WalletReadyState,
  WalletSignMessageError,
  WalletSignTransactionError,
} from "@solana/wallet-adapter-base";
import {
  type PublicKey,
  type Transaction,
  VersionedTransaction
} from "@solana/web3.js";
import { transport } from "./transport";

export const TPMCPWalletName = "TP-MCP" as WalletName<"TP-MCP">;

export class TPMCPWalletAdapter extends BaseMessageSignerWalletAdapter {
  name = TPMCPWalletName;
  url = " ";
  icon = " ";
  readonly supportedTransactionVersions = null;
  private _chainId: string;

  private _connecting: boolean;
  private _publicKey: PublicKey | null;
  private _readyState: WalletReadyState = WalletReadyState.Loadable;

  constructor(chainId: string) {
    super();
    this._connecting = false;
    this._chainId = chainId;
    this._publicKey = null;
  }

  get publicKey() {
    return this._publicKey;
  }

  get connecting() {
    return this._connecting;
  }

  get readyState() {
    return this._readyState;
  }

  async connect(): Promise<void> {
    try {
      if (this.connected || this.connecting) return;
      if (this._readyState !== WalletReadyState.Loadable)
        throw new WalletNotReadyError();

      this._connecting = true;

      const res = await transport.send({
        network: "svm",
        chainId: this._chainId,
        data: {
          method: "connect",
        },
      });

      const account = res;

      this._publicKey = account;

      this.emit("connect", account);
    } catch (error: any) {
      this.emit("error", error);
      throw error;
    } finally {
      this._connecting = false;
    }
  }

  async disconnect(): Promise<void> {
    this._publicKey = null;

    try {
      const res = await transport.send({
        network: "svm",
        chainId: this._chainId,
        data: {
          method: "disconnect",
        },
      });
    } catch (error: any) {
      this.emit("error", new WalletDisconnectionError(error?.message, error));
    }

    this.emit("disconnect");
  }

  async signTransaction<
    T extends TransactionOrVersionedTransaction<SupportedTransactionVersions>,
  >(transaction: T): Promise<T> {
    try {
      const res = await transport.send({
        network: "svm",
        chainId: this._chainId,
        data: {
          method: "signTransaction",
          data: Buffer.from(transaction.serialize()).toString("hex"),
        },
      });

      const signedTransaction = VersionedTransaction.deserialize(
        Buffer.from(res, "hex"),
      );

      return signedTransaction as T;
    } catch (error: any) {
      throw new WalletSignTransactionError(error?.message, error);
    }
  }

  async signAllTransactions<T extends Transaction>(
    transactions: T[],
  ): Promise<T[]> {
    try {
      if (!this.publicKey) throw new WalletNotConnectedError();

      try {
        const res = await transport.send({
          network: "svm",
          chainId: this._chainId,
          data: {
            method: "signAllTransactions",
            data: transactions.map((t) => t.serialize()),
          },
        });
        return res;
      } catch (error: any) {
        throw new WalletSignTransactionError(error?.message, error);
      }
    } catch (error: any) {
      this.emit("error", error);
      throw error;
    }
  }

  async signMessage(message: Uint8Array): Promise<Uint8Array> {
    try {
      const decoder = new TextDecoder();
      const data = decoder.decode(message);

      const res = await transport.send({
        network: "svm",
        chainId: this._chainId,
        data: {
          method: "signMessage",
          data,
        },
      });

      const signature = Buffer.from(res.signature, "hex");

      return signature;
    } catch (error: any) {
      throw new WalletSignMessageError(error?.message, error);
    }
  }
}
