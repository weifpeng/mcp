import {
  solana,
  solanaDevnet,
  arbitrum,
  arbitrumSepolia,
  mainnet,
} from "@reown/appkit/networks";

export const CHAIN_LIST = [
  {
    ...solana,
    network: "svm",
  },
  {
    ...solanaDevnet,
    network: "svm",
  },
  {
    ...arbitrum,
    network: "evm",
  },
  {
    ...arbitrumSepolia,
    network: "evm",
  },
  {
    ...mainnet,
    network: "evm",
  },
];
