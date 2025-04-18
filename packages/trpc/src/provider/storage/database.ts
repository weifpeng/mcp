import { drizzle } from "@mcp/database";
import { config } from "../../config";
export const db = drizzle(config.databaseUrl);
