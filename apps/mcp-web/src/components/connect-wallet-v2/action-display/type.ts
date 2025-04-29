import { z } from "zod";

export const EvmWriteMethodSchema = z.enum([
    "eth_sendTransaction",
    "eth_sendRawTransaction",
    "eth_sign",
    "eth_signTransaction",
    "eth_signTypedData_v4",
    "personal_sign",
    "wallet_addEthereumChain",
    "wallet_grantPermissions",
    "wallet_requestPermissions",
    "wallet_revokePermissions",
    "wallet_sendCalls",
    "wallet_sendTransaction",
    "wallet_switchEthereumChain",
    "wallet_watchAsset",
])

export const SolanaWriteMethodSchema = z.enum([
    "signMessage",
    "signTransaction",
    "signAllTransactions",
])  