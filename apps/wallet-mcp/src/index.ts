import { config } from "./config";
import { createCaller, trpcExpressMiddleware } from "@mcp/trpc";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import open from "open";
import { z } from "zod";
import { poolAndWaitting } from "./lib";
import path from "node:path";

const caller = createCaller({});

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
  const wallet = await caller.getWallet({
    network: "solana",
  });

  if (!wallet?.address) {
    open(`${BASE_URL}/connect`);
  }

  const walletInfo = await poolAndWaitting(
    () => caller.getWallet({ network: "solana" }),
    60 * 10,
  );

  if (!walletInfo?.address) {
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
        text: walletInfo.address,
      },
    ],
  };
});

server.tool(
  "sign-message",
  "Sign a message",
  {
    message: z.string().describe("The message to sign"),
    network: z.enum(["solana", "ethereum"]).describe("The network"),
    isHex: z.boolean().describe("Whether the message is hex"),
    address: z.string().describe("The address"),
  },
  async ({ message, network, isHex, address }) => {
    const id = await caller.addSignData({
      dataHex: isHex ? message : Buffer.from(message, "utf-8").toString("hex"),
      type: "message",
      network,
      address,
    });

    open(`${BASE_URL}/sign?id=${id}`);

    const signData = await poolAndWaitting(async () => {
      const data = await caller.getSignData({ id });

      if (data?.signedDataHex && data?.address) {
        return data;
      }
      return null;
    }, 60 * 10);

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
  "Sign and send a transaction",
  {
    transactionHex: z.string().describe("The transaction to sign"),
    network: z.enum(["solana", "ethereum"]).describe("The network"),
    address: z.string().describe("The address"),
  },
  async ({ transactionHex, network, address }) => {
    const id = await caller.addSignData({
      dataHex: transactionHex,
      type: "transaction",
      network,
      address,
    });

    open(`${BASE_URL}/sign?id=${id}`);

    const signData = await poolAndWaitting(async () => {
      const data = await caller.getSignData({ id });

      if (data?.signedDataHex && data?.address) {
        return data;
      }
      return null;
    }, 60 * 10);

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

  const app = express();

  app.use("/trpc", trpcExpressMiddleware);

  if (process.env.NODE_ENV === "development") {
    app.use(
      "/",
      createProxyMiddleware({
        target: "http://127.0.0.1:3000",
        changeOrigin: true,
      }),
    );
  } else {
    app.use("/", express.static("../out"));
  }

  const url = new URL(BASE_URL);

  app.listen(url.port);
  console.error("Solana Wallet MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
});
