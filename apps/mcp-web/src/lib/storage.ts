import { z } from "zod";

export const storageKeySchema = z.enum([
  "connect_message",
  "wallet_type",
  "setting",
]);

export const getStorage = (key: z.infer<typeof storageKeySchema>) => {
  return globalThis.localStorage?.getItem(key);
};

export const setStorage = (
  key: z.infer<typeof storageKeySchema>,
  value: string,
) => {
  globalThis.localStorage.setItem(key, value);
};

const settingSchema = z.object({
  model: z.array(
    z.object({
      apiKey: z.string(),
      apiUrl: z.string(),
      type: z.enum(["anthropic", "openai"]),
    }),
  ),
});

export const getSetting = () => {
  const setting = getStorage("setting");
  return settingSchema.parse(JSON.parse(setting || "{}"));
};

export const setSetting = (setting: z.infer<typeof settingSchema>) => {
  setStorage("setting", JSON.stringify(setting));
};
