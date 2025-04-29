import { ITransportData } from "tp-mcp-wallet/src/type";
import type { WalletClient } from "viem";

export interface IOption {
  network: "svm" | "evm" | "tron";
  chainId: string | number;
}

export interface IWallet {
  isConnected: (option: IOption) => boolean;
  getAccount: (option: IOption) => Promise<string>;
  connect: (param: IOption) => Promise<string>;
  signMessage: (message: string, option: IOption) => Promise<string>;
  signTransaction: (transactionHex: string, option: IOption) => Promise<string>;
  disconnect: (option: IOption) => Promise<void>;
}

export type NetworkType = "svm" | "evm" | "tron";

export interface IStateStore {
  showMessageDialog: boolean;
  isPending: boolean;
  isSigning: boolean;
  modelOpen: boolean;
  isConnecting: boolean;
  isConnected: boolean;
  currentMessage: ITransportMessage | null;
  connectController: {
    [topic: string]: AbortController | null;
  };
}

export interface ITransportMessage {
  id: string;
  topic: string;
  chainId: string | number;
  method: string;
  req: string;
  res: string | null;
  createdAt: string | null;
  decryptReq?: ITransportData;
  decryptRes?: any;
  status: "pending" | "success" | "error" | "processing";
  error?: string | null;
}

export interface IDataStore {
  listenMessage: boolean
  wallet: {
    address: string | null;
    network: NetworkType;
    chainId: string | number;
    type: "tp" | "wc";
  } | null;
  chain: {
    id: string | number;
    name: string;
    network: string;
  } | null;
  connectInfo: {
    [topic: string]: {
      key: string;
      date: string;
      topicIp: string | null;
    } | null
  };
  message: Array<ITransportMessage>;
}

export type EvmClientType = WalletClient;
