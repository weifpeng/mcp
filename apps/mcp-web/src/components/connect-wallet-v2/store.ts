import {
  getWalletDataState,
  storageKeySchema,
  useWalletDataState,
} from "@/lib/storage";
import { getTrpcClient } from "@/lib/trpc";
import { decrypt, encrypt } from "tp-mcp-wallet/src/encrypt";
import { ITransportDataSchema } from "tp-mcp-wallet/src/type";
import { v4 } from "uuid";
import { proxy, subscribe, useSnapshot } from "valtio";
import { PROVIDERS } from "./provider";
import type {
  IDataStore,
  IStateStore,
  ITransportMessage,
  NetworkType,
} from "./type";
import { useEffect, useState } from "react";
import type { EIP1193Parameters, WalletRpcSchema } from "viem";
import {
  EvmWriteMethodSchema,
  SvmWriteMethodSchema,
  TvmWriteMethodSchema
} from "./action-display/type";

const defaultValue: IDataStore = {
  wallet: null,
  connectInfo: {},
  chain: null,
  message: [],
  listenMessage: false,
};

export const stateStore = proxy<IStateStore>({
  isPending: false,
  isSigning: false,
  showMessageDialog: false,
  modelOpen: false,
  isConnecting: false,
  isConnected: false,
  currentMessage: null,
  connectController: {},
});

export const dataStore = proxy<IDataStore>(
  JSON.parse(
    globalThis.localStorage?.getItem(storageKeySchema.Enum.wallet_data_state) ||
      JSON.stringify(defaultValue),
  ),
);

subscribe(dataStore, () => {
  localStorage.setItem(
    storageKeySchema.Enum.wallet_data_state,
    JSON.stringify(dataStore),
  );
});

export const getWallet = (param: {
  type: "tp" | "wc";
  network: NetworkType;
}) => {
  return PROVIDERS[param.type][param.network];
};

export const setModelOpen = (open: boolean) => {
  stateStore.modelOpen = open;
};

export const setIsSigning = (isSigning: boolean) => {
  stateStore.isSigning = isSigning;
};

export const setIsPending = (isPending: boolean) => {
  stateStore.isPending = isPending;
};

export const addConnect = (connectInfo: {
  topic: string;
  key: string;
  topicIp: string | null;
}): void => {
  dataStore.connectInfo[connectInfo.topic] = {
    key: connectInfo.key,
    date: new Date().toISOString(),
    topicIp: connectInfo.topicIp,
  };
};

export const isWriteMessage = (param: {
  network: NetworkType;
  method: string;
}) => {
  if (param.network === "evm") {
    return EvmWriteMethodSchema.safeParse(param.method).success;
  }

  if (param.network === "svm") {
    return SvmWriteMethodSchema.safeParse(param.method).success;
  }

  // default is write message
  return true;
};

const updateMessage = (transportMessage: ITransportMessage) => {
  const existIndex = dataStore.message.findIndex(
    (m) => m.id === transportMessage.id,
  );
  if (existIndex !== -1) {
    dataStore.message[existIndex] = {
      ...transportMessage,
    };
  } else {
    dataStore.message.push({
      ...transportMessage,
    });
  }
};

export const callWallet = async (transportMessage: ITransportMessage) => {
  const { decryptReq } = transportMessage;
  if (!decryptReq) {
    return;
  }
  const key = dataStore.connectInfo[transportMessage.topic]?.key;
  if (!key) {
    return;
  }

  let walletResult: any;
  let error = "";

  try {
    walletResult = await getWallet({
      type: "tp",
      network: decryptReq.network,
    }).request(`${decryptReq.chainId}`, JSON.parse(JSON.stringify(decryptReq.data)));
  } catch (e: any) {
    error = e.message;
    walletResult = { error: e.message };
  }

  const client = getTrpcClient();
  const encryptData = await encrypt(JSON.stringify(walletResult), key);

  await client.message.send.mutate({
    id: transportMessage.id,
    topic: transportMessage.topic,
    chainId: `${transportMessage.chainId}`,
    method: transportMessage.method,
    req: transportMessage.req,
    status: error ? "error" : "success",
    res: encryptData,
    error,
  });

  transportMessage.decryptRes = walletResult;
  transportMessage.status = error ? "error" : "success";
  updateMessage(transportMessage);
};

const handleMessage = async (transportMessage: ITransportMessage) => {
  const localStorageMsg = getWalletDataState().message.find(
    (m) => m.id === transportMessage.id,
  );
  if (localStorageMsg) {
    return;
  }

  dataStore.message.push({
    ...transportMessage,
  });

  const { decryptReq } = transportMessage;
  if (!decryptReq) {
    return;
  }

  if (
    isWriteMessage({
      network: decryptReq.network,
      method: decryptReq.data.method,
    })
  ) {
    if (!stateStore.currentMessage) {
      stateStore.currentMessage = transportMessage;
      stateStore.isSigning = false;
      stateStore.showMessageDialog = true;
    }
    updateMessage(transportMessage);
    return;
  }
  await callWallet(transportMessage);
};

export const confirmCurrentMessage = async () => {
  if (!stateStore.currentMessage) return;
  stateStore.isSigning = true;
  try {
    await callWallet(stateStore.currentMessage);
    stateStore.showMessageDialog = false;
    stateStore.currentMessage = null;
  } catch (e) {
    console.error(e);
  } finally {
    stateStore.isSigning = false;
  }
};

const listenMessage = async (topic: string) => {
  const key = dataStore.connectInfo[topic]?.key;
  if (!key) {
    return;
  }
  const client = getTrpcClient();

  if (stateStore.connectController[topic]) {
    stateStore.connectController[topic]?.abort();
  }

  const controller = new AbortController();
  stateStore.connectController[topic] = controller;

  try {
    const dataStoreCurr = getWalletDataState();
    const messageData = await client.message.listen.query(
      {
        topic: topic,
        timestamp: new Date(
          dataStoreCurr.message?.[dataStoreCurr.message.length - 1]
            ?.createdAt || new Date().getTime() - 1000 * 30,
        ).getTime(),
      },
      {
        signal: controller.signal,
      },
    );
    stateStore.connectController[topic] = null;

    const messageSet = new Set(dataStore.message?.map((m) => m.id));
    for (const m of messageData) {
      if (messageSet.has(m.id)) {
        continue;
      }
      const data = await decrypt(m.req, key);

      const transportData = ITransportDataSchema.parse(JSON.parse(data));
      const msg = {
        ...m,
        decryptReq: transportData,
      };
      await handleMessage(msg);
    }
  } catch (e) {
    console.error(e);
  }
  listenMessage(topic);
};

export const initConnecting = async () => {
  if (!dataStore.message) {
    dataStore.message = [];
  }
  dataStore.listenMessage = true;
  for (const topic in dataStore.connectInfo) {
    listenMessage(topic);
  }
};

export const removeListen = (topic: string) => {
  delete dataStore.connectInfo[topic];
  if (stateStore.connectController[topic]) {
    stateStore.connectController[topic]?.abort();
  }
};

export const useWalletDataStateCurr = () => {
  const [data, setData] = useState(getWalletDataState());
  const state = useSnapshot(dataStore);
  const [localStorageData] = useWalletDataState();

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    setData(getWalletDataState());
  }, [state, localStorageData]);

  return data;
};
