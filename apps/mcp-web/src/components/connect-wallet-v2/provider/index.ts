import * as tpWalletProvider from "./tp/solana";
import * as tpEvmWalletProvider from "./tp/evm";
import * as tpTvmWalletProvider from "./tp/tvm";

export const PROVIDERS = {
  tp: {
    svm: tpWalletProvider,
    evm: tpEvmWalletProvider,
    tvm: tpTvmWalletProvider,
  },
  wc: {
    svm: tpWalletProvider,
    evm: tpWalletProvider,
    tvm: tpWalletProvider,
  },
};
