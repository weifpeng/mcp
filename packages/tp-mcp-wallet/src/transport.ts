import type { AppRouter } from "@tokenpocket/trpc";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import open from "open";
import type { z } from "zod";
import { config } from "./config";
import { decrypt, encrypt, generateKey, hashSHA256 } from "./encrypt";
import type { ITransportDataSchema } from "./type";

async function poolAndWaitting<T>(
  call: () => Promise<T>,
  timeout: number,
  interval: number = 1000,
) {
  const startTime = Date.now();
  for (let i = 0; i < timeout / interval; i++) {
    if (Date.now() - startTime > timeout) {
      throw new Error("timeout");
    }
    try {
      const result = await call();
      if (result) {
        return result;
      }
    } catch (e) {}
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  return null;
}

const client = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${config.TP_MCP_WALLET_URL}/trpc`,
    }),
  ],
});

export class Transport {
  privateKey: string;

  constructor() {
    // topic=4303a429d2dc55bdfb688c34eb6482c251334a9180629ae981258bd10d98fee4&key=da5a520a3bd789468229387c8199131bffe84886405f58906b2ed22bfc5548e9
    // this.privateKey = generateKey();
    this.privateKey =
      "da5a520a3bd789468229387c8199131bffe84886405f58906b2ed22bfc5548e9";
  }

  async send(data: z.infer<typeof ITransportDataSchema>) {
    try {
      const encryptedData = await encrypt(
        JSON.stringify(data),
        this.privateKey,
      );

      const topic = await hashSHA256(this.privateKey);

      const postRes = await client.message.send.mutate({
        topic,
        chainId: `${data.chainId}`,
        method: data.data.method,
        req: encryptedData,
      });

      const isActive = await client.conn.isActive.query({ topic });

      if (!isActive) {
        open(
          `${config.TP_MCP_WALLET_URL}/connect/active?topic=${topic}&key=${this.privateKey}`,
        );
      }

      const response = await poolAndWaitting(async () => {
        try {
          const resData = await client.message.listen.query({
            topic,
            id: postRes,
          });
          return resData[0].res;
        } catch (e) {
          throw e;
        }
      }, 30000);

      if (!response) {
        throw new Error("timeout");
      }
      const decryptedData = await decrypt(response, this.privateKey);

      console.log("decryptedData", decryptedData);

      return JSON.parse(decryptedData);
    } catch (e) {
      throw new Error(`transport error: ${e.message}`);
    }
  }
}

export const transport = new Transport();
