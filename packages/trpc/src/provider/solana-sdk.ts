import { SolanaSDK } from "@mcp/solana";
import { config } from "../config"
import { getGlobalData } from "./storage";

export const solanaSdk = new SolanaSDK({ rpcUrl: config.rpcUrl, privateKey: "", heliusApiKey: config.heliusApiKey });

export const getSolanaSdk = () => {
    return new SolanaSDK({ rpcUrl: config.rpcUrl, privateKey: getGlobalData().privateKey, heliusApiKey: config.heliusApiKey });
}
