import { drizzle } from "@tokenpocket/database";
import { config } from "../../config";
export const db = drizzle(config.databaseUrl);
