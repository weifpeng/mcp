import { CHAIN_LIST } from "@tokenpocket/constanst/src/chain";
import {
  createTpMCPEvmWalletClient,
  TPMCPWalletSvmAdapter,
  TPMCPWalletTvmAdapter,
} from "tp-mcp-wallet";
import type { Chain } from "viem";
import { z } from "zod";

export const name = "connect-wallet";
export const description = "Connect to the wallet";
export const paramSchema = {
  chain_id: z
    .string()
    .describe(
      "The chain id form our list-chains response, if you want to connect to the default chain, you can leave it empty",
    ),
};

const connectWalletSchema = z.object(paramSchema);

export const handle = async (param: z.infer<typeof connectWalletSchema>) => {
  const { chain_id } = param;

  try {
    const chain = CHAIN_LIST.find((c) => `${c.id}` === `${chain_id}`);

    if (!chain) {
      return {
        content: [
          {
            type: "text",
            text: "chain not found",
          },
        ],
      };
    }

    if (chain.network === "evm") {
      const client = createTpMCPEvmWalletClient({
        chain: chain as unknown as Chain,
      });

      const addresses = await client.requestAddresses();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(addresses),
          },
        ],
      };
    }

    if (chain.network === "svm") {
      const client = new TPMCPWalletSvmAdapter(chain.id as string);

      await client.connect();
      const addresses = client.publicKey;

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(addresses),
          },
        ],
      };
    }

    if (chain.network === "tvm") {
      const tvmClient = new TPMCPWalletTvmAdapter(
        chain.id as unknown as string,
      );

      const res = await tvmClient.connect();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(res),
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: "network not supported",
        },
      ],
    };
  } catch (e) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            error: e.message,
            stack: e.stack,
          }),
        },
      ],
    };
  }
};
