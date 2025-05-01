import { CHAIN_LIST } from "@tokenpocket/constanst/src/chain";
import { Decimal } from "decimal.js";
import { TPMCPWalletTvmAdapter } from "tp-mcp-wallet";
import { TronWeb } from "tronweb";
import { z } from "zod";

export const name = "send-trx";
export const description = "Send trx to the destination address";

export const paramSchema = {
  chain_id: z.string().describe("the chain id"),
  amount: z.number().describe("the amount of trx to send"),
  from: z.string().describe("the user wallet tron address"),
  to: z.string().describe("the destination wallet tron address"),
};

const paramZodSchema = z.object(paramSchema);

export const handle = async (param: z.infer<typeof paramZodSchema>) => {
  const { chain_id, amount, from, to } = param;

  const chain = CHAIN_LIST.find((chain) => `${chain.id}` === `${chain_id}`);

  if (!chain) {
    throw new Error("chain not found");
  }

  const tron = new TronWeb({
    fullHost: chain.rpc_url,
  });

  const transaction = await tron.transactionBuilder.sendTrx(
    to,
    new Decimal(amount).times(10 ** 6).toNumber(),
    from,
  );

  const tvmClient = new TPMCPWalletTvmAdapter(chain_id);

  const txData = await tvmClient.signTransaction(transaction);

  const res = await tron.trx.sendRawTransaction(txData);

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(res),
      },
    ],
  };
};
