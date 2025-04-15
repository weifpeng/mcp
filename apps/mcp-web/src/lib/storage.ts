import { z } from "zod";

export const storageKeySchema = z.enum(["connect_message", "wallet_type"]);

export const getStorage = (key: z.infer<typeof storageKeySchema>) => {
  return globalThis.localStorage?.getItem(key);
};

export const setStorage = (
  key: z.infer<typeof storageKeySchema>,
  value: string,
) => {
  globalThis.localStorage.setItem(key, value);
};
