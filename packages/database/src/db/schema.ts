import { createId } from "@paralleldrive/cuid2";
import { pgEnum, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createSelectSchema, createInsertSchema } from "drizzle-zod";
import { z } from "zod";

const auditSchema = {
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: varchar("created_by", { length: 255 }),
  updatedBy: varchar("updated_by", { length: 255 }),
};

export const networkEnum = pgEnum("network", ["solana", "ethereum"]);
export const signTypeEnum = pgEnum("sign_type", ["transaction", "message"]);

export const signDataTable = pgTable("sign_data", {
  id: varchar({ length: 128 }).primaryKey().$default(createId),
  address: varchar({ length: 255 }).notNull(),
  dataHex: text("data_hex").notNull(),
  signedDataHex: text("signed_data_hex"),
  txHash: varchar("tx_hash", { length: 255 }),
  network: networkEnum().notNull(),
  type: signTypeEnum().notNull(),
  ...auditSchema,
});

export const signDataSelectSchema = createSelectSchema(signDataTable);
export const signDataInsertSchema = createInsertSchema(signDataTable);

export const messageStatusEnum = pgEnum("message_status", ["pending", "success", "error"]);

export const messageDataTable = pgTable("message_data", {
  id: varchar({ length: 128 }).primaryKey().$default(createId),
  topic: varchar({ length: 255 }).notNull(),
  address: varchar({ length: 255 }),
  chainId: varchar({ length: 255 }).notNull(),
  method: varchar({ length: 255 }).notNull(),
  req: text("req").notNull(),
  res: text("res"),
  status: messageStatusEnum().notNull().default("pending"),
  error: text("error"),
  ...auditSchema,
});

export const messageDataSelectSchema = createSelectSchema(messageDataTable);
export const messageDataInsertSchema = createInsertSchema(messageDataTable);

export type MessageDataType = z.infer<typeof messageDataSelectSchema> 
