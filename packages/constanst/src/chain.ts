import {
  solana,
  solanaDevnet,
  arbitrum,
  arbitrumSepolia,
  mainnet,
  tron,
  bsc,
} from "@reown/appkit/networks";

export const CHAIN_LIST = [
  {
    ...solana,
    network: "svm" as const,
    rpc_url: "https://api.mainnet-beta.solana.com",
  },
  {
    ...solanaDevnet,
    network: "svm" as const,
    rpc_url: "https://api.devnet.solana.com",
  },
  {
    ...arbitrum,
    network: "evm" as const,
    rpc_url: "https://arb1.arbitrum.io/rpc",
  },
  {
    ...arbitrumSepolia,
    network: "evm" as const,
    rpc_url: "https://sepolia-rollup.arbitrum.io/rpc",
  },
  {
    ...mainnet,
    network: "evm" as const,
    rpc_url: "https://eth.merkle.io",
  },
  {
    ...bsc,
    network: "evm" as const,
    rpc_url: "https://56.rpc.thirdweb.com",
  },
  {
    ...tron,
    network: "tvm" as const,
    rpc_url: "https://api.trongrid.io",
  },
];
