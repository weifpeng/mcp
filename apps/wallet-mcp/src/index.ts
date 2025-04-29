import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { EVM_CHAIN_LIST, SVM_CHAIN_LIST } from "@tokenpocket/constanst";
import { CHAIN_LIST } from "@tokenpocket/constanst/src/chain";
import { createTpMCPEvmWalletClient } from "tp-mcp-wallet";
import { TPMCPWalletSvmAdapter } from "tp-mcp-wallet";
import type { Chain } from "viem";
import { createPublicClient, http, parseEther } from "viem";

// Create server instance
const server = new McpServer({
  name: "wallet-mcp",
  version: "1.0.0",
  capabilities: {
    tools: {},
  },
});

server.tool(
  "connect-wallet",
  "Connect to the wallet",
  {
    chain_id: z
      .string()
      .describe(
        "The chain id form our list-chains response, if you want to connect to the default chain, you can leave it empty",
      ),
  },
  async ({ chain_id }) => {
    try {
      const chain = CHAIN_LIST.find((c) => `${c.id}` === chain_id);

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
  },
);

server.tool("list-chains", "List all chains", {}, async () => {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify([
          {
            type: "evm",
            chains: EVM_CHAIN_LIST,
          },
          {
            type: "svm",
            chains: SVM_CHAIN_LIST,
          },
        ]),
      },
    ],
  };
});

server.tool(
  "get-balance",
  "Get balance of the wallet",
  {
    chainId: z.string(),
    address: z.string(),
  },
  async ({ chainId, address }: { chainId: string; address: string }) => {
    const chain = CHAIN_LIST.find((chain) => `${chain.id}` === `${chainId}`);

    if (!chain) {
      throw new Error("chain not found");
    }

    const publicClient = createPublicClient({
      chain: chain as Chain,
      transport: http(),
    });

    const balance = await publicClient.getBalance({
      address: address as `0x${string}`,
    });

    return {
      content: [
        {
          type: "text",
          text: balance.toString(),
        },
      ],
    };
  }
);

server.tool(
  "send-eth",
  "send eth to the destination wallet from the user wallet",
  {
    amount: z.string().describe("the amount of eth to send"),
    account: z.string().describe("the user wallet evm address"),
    to: z.string().describe("the destination wallet evm address"),
    chainId: z.number().describe("the chain id"),
  },
  async ({ amount, account, to, chainId }) => {
    const chain = CHAIN_LIST.find((chain) => chain.id === chainId);

    if (!chain) {
      throw new Error("chain not found");
    }

    const walletClient = createTpMCPEvmWalletClient({
      chain: chain as Chain,
    });

    const amountWei = parseEther(amount.toString());

    const tx = await walletClient.sendTransaction({
      chain: chain as Chain,
      account: account as `0x${string}`,
      to: to as `0x${string}`,
      value: amountWei,
    });

    return {
      content: [
        {
          type: "text",
          text: tx,
        },
      ],
    };
  },
);



async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Wallet MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
});
