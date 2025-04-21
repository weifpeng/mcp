import { z } from "zod";
import { useLocalStorageState } from "ahooks";

export const storageKeySchema = z.enum([
  "connect_message",
  "wallet_type",
  "setting",
  "token",
  "connect_id",
  "sign_data_id",
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

export const getToken = () => {
  return getStorage("token");
};

export const setToken = (token: string) => {
  setStorage("token", token);
};

export const getConnectId = () => {
  return getStorage("connect_id");
};

export const setConnectId = (connectId: string) => {
  setStorage("connect_id", connectId);
};

export const clearAll = () => {
  globalThis.localStorage.clear();
};

export const useSettingState = () => {
  return useLocalStorageState<z.infer<typeof settingSchema> | undefined>(
    storageKeySchema.enum.setting,
    {
      defaultValue: undefined,
      listenStorageChange: true,
    },
  );
};

export const useTokenState = () => {
  return useLocalStorageState<string | undefined>(storageKeySchema.enum.token, {
    defaultValue: "",
    listenStorageChange: true,
  });
};

export const useSignDataState = () => {
  return useLocalStorageState<string>(storageKeySchema.enum.sign_data_id, {
    defaultValue: "",
    listenStorageChange: true,
  });
};
