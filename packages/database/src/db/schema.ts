import { createId } from "@paralleldrive/cuid2";
import { pgEnum, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createSelectSchema, createInsertSchema } from "drizzle-zod";

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
