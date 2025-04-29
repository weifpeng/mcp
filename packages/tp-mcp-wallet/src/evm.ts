import type { Chain } from "viem";
import { createWalletClient, custom } from "viem";
import { transport } from "./transport";

export function createTpEvmWalletClient(param: { chain: Chain }) {
  return createWalletClient({
    chain: param.chain,
    transport: custom({
      request: async (args) => {
        try {

          const res = await transport.send({
            network: "evm",
            chainId: param.chain.id,
            data: args,
          });

          if (res.error) {
            throw new Error(res.error);
          }

          return res;
        } catch (e) {
          return e.message;
        }
      },
    }),
  });
}
