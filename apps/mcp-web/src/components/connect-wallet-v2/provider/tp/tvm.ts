const tronWeb = globalThis.window?.tokenpocket?.tronWeb;
const tron = globalThis.window?.tokenpocket?.tron;

export const request = async (
  chainId: string,
  param: {
    method: string;
    data: any;
  },
) => {
  const { method, data } = param;

  if (method === "request") {
    return await tron?.request(data);
  }

  if (method === "sign") {
    return await tronWeb?.trx.sign(data.transaction);
  }

  if (method === "multiSign") {
    return await tronWeb?.trx.multiSign(data.transaction, data.permissionId);
  }

  if (method === "signMessageV2") {
    return await tronWeb?.trx.signMessageV2(data.message);
  }
};
