import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { TronWeb } from "tronweb";
import * as sendTrxTool from "./tools/send-trx";
 
const server = new McpServer({
  name: "tron mcp",
  version: "1.0.0",
  capabilities: {
    tools: {},
  },
});

server.tool(
  sendTrxTool.name,
  sendTrxTool.description,
  sendTrxTool.paramSchema,
  sendTrxTool.handle,
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Tron MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
});
