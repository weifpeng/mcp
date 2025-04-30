import type {
  SignedTransaction,
  Transaction,
} from "@tronweb3/tronwallet-abstract-adapter";

import { transport } from "./transport";

export class TPMCPWalletAdapter {
  private chainId: string;

  constructor(chainId: string) {
    this.chainId = chainId;
  }

  async connect(): Promise<void> {
    const res = await transport.send({
      network: "tvm",
      chainId: this.chainId,
      data: {
        method: "request",
        data: {
          method: "eth_requestAccounts",
        },
      },
    });
    console.log(res);
    return res;
  }

  async signTransaction(transaction: Transaction): Promise<SignedTransaction> {
    const res = await transport.send({
      network: "tvm",
      chainId: this.chainId,
      data: {
        method: "sign",
        data: { transaction },
      },
    });
    return res;
  }

  async multiSign(
    transaction: Transaction,
    permissionId?: number,
  ): Promise<SignedTransaction> {
    const res = await transport.send({
      network: "tvm",
      chainId: this.chainId,
      data: {
        method: "multiSign",
        data: { transaction, permissionId },
      },
    });
    return res;
  }

  async signMessage(message: string): Promise<string> {
    const res = await transport.send({
      network: "tvm",
      chainId: this.chainId,
      data: {
        method: "signMessageV2",
        data: { message },
      },
    });
    return res;
  }
}
