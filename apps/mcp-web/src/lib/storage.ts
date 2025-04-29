import { z } from "zod";
import type { IDataStore } from "@/components/connect-wallet-v2/type";
import useLocalStorageState from "use-local-storage-state"
export const storageKeySchema = z.enum([
  "connect_message",
  "wallet_type",
  "setting",
  "token",
  "connect_id",
  "sign_data_id",
  "connect_info",
  "wallet_data_state",
]);


export const useWalletDataState = () => {
  return useLocalStorageState<IDataStore>(storageKeySchema.enum.wallet_data_state, {
    defaultValue: {
      wallet: null,
      connectInfo: {},
      chain: null,
      message: [],
      listenMessage: false,
    }
  });
};

export const getWalletDataState = () => {
  return JSON.parse(globalThis.localStorage?.getItem(storageKeySchema.enum.wallet_data_state) || "{}") as IDataStore;
};




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
  setStorage("token", JSON.stringify(token));
};

export const getConnectId = () => {
  return getStorage("connect_id");
};

export const setConnectId = (connectId: string) => {
  setStorage("connect_id", connectId);
};

export const useConnectInfoState = () => {
  return useLocalStorageState<{
    topic: string;
    key: string;
  }>(storageKeySchema.enum.connect_info, {
    defaultValue: {
      topic: "",
      key: "",
    },
  });
};

export const clearAll = () => {
  globalThis.localStorage.clear();
};

export const useSettingState = () => {
  return useLocalStorageState<z.infer<typeof settingSchema> | undefined>(
    storageKeySchema.enum.setting,
    {
      defaultValue: undefined
    },
  );
};

export const useTokenState = () => {
  return useLocalStorageState<string | undefined>(storageKeySchema.enum.token, {
    defaultValue: "",
  });
};

export const useSignDataState = () => {
  return useLocalStorageState<string>(storageKeySchema.enum.sign_data_id, {
    defaultValue: "",
  });
};
