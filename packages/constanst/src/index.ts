import { CHAIN_LIST } from "./chain";

export const EVM_CHAIN_LIST = CHAIN_LIST.filter(
  (chain) => chain.network === "evm",
);
export const SVM_CHAIN_LIST = CHAIN_LIST.filter(
  (chain) => chain.network === "svm",
);
