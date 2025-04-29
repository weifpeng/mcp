import * as tpWalletProvider from "./tp/solana";
import * as tpEvmWalletProvider from "./tp/evm";

export const PROVIDERS = {
  tp: {
    svm: tpWalletProvider,
    evm: tpEvmWalletProvider,
    tron: tpWalletProvider,
  },
  wc: {
    svm: tpWalletProvider,
    evm: tpWalletProvider,
    tron: tpWalletProvider,
  },
};
