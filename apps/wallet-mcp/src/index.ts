import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import open from "open";
import { z } from "zod";
import { config } from "./config";
import { getTrpcClient, poolAndWaitting } from "./lib";
const BASE_URL = config.BASE_URL;

// Create server instance
const server = new McpServer({
  name: "tokenpocket-wallet",
  version: "1.0.0",
  capabilities: {
    tools: {},
  },
});

server.tool("connect-wallet", "Connect to the wallet", {}, async () => {
  const client = await getTrpcClient();
  const wallet = await client.getWallet.query();

  if (!wallet?.address) {
    return {
      content: [
        {
          type: "text",
          text: "time out",
        },
      ],
    };
  }

  return {
    content: [
      {
        type: "text",
        text: wallet.address,
      },
    ],
  };
});

server.tool(
  "sign-message",
  "Sign a message, we will send the message to the server and wait for user signed",
  {
    message: z.string().describe("The message to sign"),
    network: z.enum(["solana", "ethereum"]).describe("The network"),
    isHex: z.boolean().describe("Whether the message is hex"),
    address: z.string().describe("The address"),
  },
  async ({ message, network, isHex, address }) => {
    const client = await getTrpcClient();

    const id = await client.addSignData.mutate({
      dataHex: isHex ? message : Buffer.from(message, "utf-8").toString("hex"),
      type: "message",
      network,
      address,
    });
    open(`${BASE_URL}/sign?id=${id}`);
    const signData = await poolAndWaitting(async () => {
      const data = await client.getSignData.query({ id: id! });

      if (data?.signedDataHex && data?.address) {
        return data;
      }
      return null;
    }, 60 * 5);

    if (!signData?.signedDataHex || !signData.address) {
      return {
        content: [
          {
            type: "text",
            text: "timeout",
          },
          {
            type: "text",
            text: JSON.stringify(signData),
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            address: signData.address,
            signature: signData.signedDataHex,
          }),
        },
      ],
    };
  },
);

server.tool(
  "sign-transaction",
  "Sign and send a transaction, we will send the transaction hex to the server and wait for user signed",

  {
    transactionHex: z.string().describe("The transaction to sign"),
    network: z.enum(["solana", "ethereum"]).describe("The network"),
    address: z.string().describe("The address"),
  },
  async ({ transactionHex, network, address }) => {
    const client = await getTrpcClient();

    const id = await client.addSignData.mutate({
      dataHex: transactionHex,
      type: "transaction",
      network,
      address,
    });
    open(`${BASE_URL}/sign?id=${id}`);

    const signData = await poolAndWaitting(async () => {
      const data = await client.getSignData.query({ id: id! });

      if (data?.signedDataHex && data?.address) {
        return data;
      }
      return null;
    }, 60 * 5);

    if (!signData?.signedDataHex || !signData.address) {
      return {
        content: [
          {
            type: "text",
            text: "timeout",
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: "user signed and send transaction",
        },
        {
          type: "text",
          text: JSON.stringify({
            address: signData.address,
            signedDataHex: signData.signedDataHex,
            txHash: signData.txHash,
          }),
        },
        {
          type: "text",
          text: signData.txHash
            ? `transaction send success, tx: ${signData.txHash}`
            : "transaction sign success but send failed",
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
