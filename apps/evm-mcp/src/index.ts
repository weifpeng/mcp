import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import type { Chain } from "viem/chains";
import { createTpMCPEvmWalletClient } from "tp-mcp-wallet";
import { CHAIN_LIST } from "@tokenpocket/constanst/src/chain";
import { parseEther } from "viem";

// Create server instance
const server = new McpServer({
  name: "evm",
  version: "1.0.0",
  capabilities: {
    tools: {},
  },
});

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
          text: `transaction hash send success: ${tx}`,
        },
      ],
    };
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("EVM MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
});
