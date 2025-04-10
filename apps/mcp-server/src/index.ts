import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { trpcExpressMiddleware } from '@mcp/trpc';
import express from 'express';
import { addSolanaTools } from "./tools/index.js";
import { createProxyMiddleware } from 'http-proxy-middleware';

// Create server instance
const server = new McpServer({
    name: "solana-wallet",
    version: "1.0.0",
    capabilities: {
        resources: {},
        tools: {},
    },
});

addSolanaTools(server);

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);

    const app = express();

    app.use(
        '/trpc',
        trpcExpressMiddleware,
    );

    app.use('/', createProxyMiddleware({
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
    }));

    app.listen(4000);
    console.error("Solana Wallet MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Fatal error in main():", error);
});

