import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import qr from "qrcode";
import open from "open";
import { createCaller } from "@mcp/trpc";

const caller = createCaller({});

export const addSolanaTools = (server: McpServer) => {
  server.tool(
    "is-init-solana-wallet",
    "Check if the Solana wallet is initialized",
    {},
    async () => {
      const isInit = await caller.isInitSolanaWallet();
      return {
        content: [
          {
            type: "text",
            text: isInit ? "true" : "false",
          },
        ],
      };
    },
  );

  server.tool(
    "init-solana-wallet",
    "Initialize a new Solana wallet",
    {},
    async () => {
      const isInit = await caller.isInitSolanaWallet();

      if (isInit) {
        return {
          content: [
            {
              type: "text",
              text: "Solana wallet is already initialized",
            },
          ],
        };
      }

      open("http://localhost:4000/tp");

      for (let i = 0; i < 10; i++) {
        await new Promise((resolve) => setTimeout(resolve, 5000));

        const checkInit = await caller.isInitSolanaWallet();
        if (checkInit) {
          return {
            content: [
              {
                type: "text",
                text: "Solana wallet has been initialized successfully",
              },
            ],
          };
        }
      }

      return {
        content: [
          {
            type: "text",
            text: "please continue in browser to complete the process",
          },
        ],
      };
    },
  );

  server.tool(
    "deposit-solana",
    "Deposit tokens to your Solana wallet",
    {},
    async ({}) => {
      return {
        content: [
          {
            type: "text",
            text: `Please send token to your Solana wallet address: ![qr.png](http://localhost:3000/qr.png). The transaction will be confirmed on the blockchain shortly.`,
          },
        ],
      };
    },
  );

  server.tool(
    "show-solana-address",
    "Show your Solana wallet address",
    {},
    async ({}) => {
      const { address } = await caller.getSolanaWallet();

      const qrCode = await qr.toDataURL(address);

      return {
        content: [
          {
            type: "text",
            text: address,
          },
          {
            type: "image",
            data: qrCode.replace("data:image/png;base64,", ""),
            mimeType: "image/png",
          },
        ],
      };
    },
  );

  server.tool(
    "get-solana-balance",
    "Get your Solana wallet balance",
    {},
    async ({}) => {
      const balance = await caller.getSolanaBalance();

      return {
        content: [
          {
            type: "text",
            text: balance.toString(),
          },
        ],
      };
    },
  );

  server.tool(
    "issue-spl-token",
    "Issue a new SPL token on Solana",
    {
      name: z.string().describe("用户想要发行的代币名称"),
      imageUrl: z.string().describe("用户想要发行的代币图片URL"),
      symbol: z.string().describe("用户想要发行的代币符号"),
      decimals: z.number().describe("用户想要发行的代币小数位数"),
      initialSupply: z.number().describe("用户想要发行的代币初始供应量"),
    },
    async ({ name, imageUrl, symbol, decimals, initialSupply }) => {
      const result = await caller.createToken({
        name,
        imageUrl,
        symbol,
        decimals,
        initialSupply,
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result),
          },
        ],
      };
    },
  );

  server.tool(
    "list-spl-token",
    "List all SPL tokens in address",
    {
      address: z.string().describe("用户想要查询的 Solana 地址"),
    },
    async ({ address }) => {
      const result = await caller.listSplToken({
        address,
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result),
          },
        ],
      };
    },
  );

  server.tool(
    "transfer-spl-token",
    "Transfer SPL tokens to a specific address",
    {
      toAddress: z.string().describe("用户想要转账的 Solana 地址"),
      tokenAddress: z.string().describe("用户想要转账的 SPL token 地址"),
      amount: z.number().describe("用户想要转账的 SPL token 数量，整数精度"),
    },
    async ({ toAddress, tokenAddress, amount }) => {
      const result = await caller.transferSplToken({
        toAddress,
        tokenAddress,
        amount,
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result),
          },
        ],
      };
    },
  );

  server.tool(
    "buy-solana-to-address",
    "Buy SOL tokens to a specific address",
    {
      amount: z.number().describe("用户想要购买的SOL数量"),
      address: z.string().describe("用户想充值的 Solana 地址"),
    },
    async ({ amount, address }) => {
      open(
        `https://buy.transit.finance/ramp?address=${address}&amount=${amount}`,
      );
      return {
        content: [
          {
            type: "text",
            text: "user can continue in browser to complete the buy process",
          },
        ],
      };
    },
  );
};
