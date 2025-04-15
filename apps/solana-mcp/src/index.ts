import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { SolanaSDK } from "@mcp/solana";
import { PublicKey } from "@solana/web3.js";
import { Decimal } from "decimal.js";

const solana = new SolanaSDK({
  rpcUrl: process.env.RPC_URL!,
});

// Create server instance
const server = new McpServer({
  name: "solana swap",
  version: "1.0.0",
  capabilities: {
    tools: {},
  },
});

server.tool(
  "create-token",
  "create token on solana",
  {
    name: z.string().describe("the token name"),
    imageUrl: z.string().describe("the token image url"),
    symbol: z.string().describe("the token symbol"),
    decimals: z.number().describe("the token decimals"),
    initialSupply: z.number().describe("the token initial supply"),
    userAddress: z.string().describe("the user wallet solana address"),
  },
  async ({ name, imageUrl, symbol, decimals, initialSupply, userAddress }) => {
    const instruction = await solana.buildCreateMintTransactionInstruction({
      from: new PublicKey(userAddress),
      name,
      symbol,
      decimals,
    });

    const latestBlockhash = await solana.connection.getLatestBlockhash();

    const tx = solana.buildTransaction({
      instructions: [...instruction],
      addressLookupTableAddresses: [],
      blockhash: latestBlockhash.blockhash,
      feePayer: new PublicKey(userAddress),
    });

    const txData = Buffer.from(tx.serialize()).toString("hex");

    return {
      content: [
        {
          type: "text",
          text: "use wallet to sign the following data",
        },
        {
          type: "text",
          text: txData,
        },
      ],
    };
  },
);

server.tool(
  "send-sol",
  "build send sol to the user transaction to be signed",
  {
    amount: z.number().describe("the amount of sol to send"),
    from: z.string().describe("the user wallet solana address"),
    to: z.string().describe("the destination wallet solana address"),
  },
  async ({ amount, from, to }) => {
    const instruction = await solana.buildSendSolTransactionInstruction({
      from: from,
      to: to,
      amount: new Decimal(amount).mul(10 ** 9).toString(),
    });

    const blockhash = await solana.connection.getLatestBlockhash();

    const transaction = await solana.buildTransaction({
      instructions: [...instruction],
      addressLookupTableAddresses: [],
      blockhash: blockhash.blockhash,
      feePayer: new PublicKey(from),
    });

    const txData = Buffer.from(transaction.serialize()).toString("hex");

    return {
      content: [
        {
          type: "text",
          text: "use wallet to sign the following data",
        },
        {
          type: "text",
          text: txData,
        },
      ],
    };
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Solana Wallet MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
});
