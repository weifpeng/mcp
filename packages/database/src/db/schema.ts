import { createId } from "@paralleldrive/cuid2";
import { pgEnum, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

const auditSchema = {
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
};

export const networkEnum = pgEnum("network", ["solana", "ethereum"]);
export const signTypeEnum = pgEnum("sign_type", ["transaction", "message"]);

export const signDataTable = pgTable("sign_data", {
  id: varchar({ length: 128 }).primaryKey().default(createId()),
  address: varchar({ length: 255 }).notNull(),
  dataHex: text("data_hex").notNull(),
  signedDataHex: text("signed_data_hex"),
  txHash: varchar("tx_hash", { length: 255 }),
  network: networkEnum().notNull(),
  type: signTypeEnum().notNull(),
  ...auditSchema,
});

export const tokenSchema = pgTable("token", {
  id: varchar({ length: 128 }).primaryKey().default(createId()),
  address: varchar({ length: 255 }).notNull(),
  
  token: varchar({ length: 128 }).notNull(),
  ...auditSchema,
});
