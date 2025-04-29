import { CHAIN_LIST } from "@tokenpocket/constanst/src/chain";
import { type Chain, createWalletClient, custom } from "viem";

const getWalletClient = async (chainId: string | number) => {
  const chain = CHAIN_LIST.find((c) => `${c.id}` === `${chainId}`);
  if (!chain) return null;

  const client = createWalletClient({
    chain: chain as Chain,
    transport: custom(window?.tokenpocket?.ethereum!),
  });

  await client.switchChain(chain as Chain);

  return client;
};

export const request = async (chainId: string | number, data: any) => {
  const client = await getWalletClient(chainId);
  const result = await client?.request(JSON.parse(JSON.stringify(data)));
  return result;
};
