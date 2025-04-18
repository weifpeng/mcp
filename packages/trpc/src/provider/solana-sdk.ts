import { SolanaSDK } from "@tokenpocket/solana";
import { config } from "../config";

export const solanaSdk = new SolanaSDK({ rpcUrl: config.rpcUrl });
export const getSolanaSdk = () => {
  return new SolanaSDK({ rpcUrl: config.rpcUrl });
};
