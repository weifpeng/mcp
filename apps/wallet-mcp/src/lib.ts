import type { AppRouter } from "@mcp/trpc";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { TRPCClient } from "@trpc/client";
import { config } from "./config";
import { v4 as uuidv4 } from "uuid";
import { decodeJwt } from "jose";
import open from "open";

export async function poolAndWaitting<T>(
  call: () => Promise<T>,
  timeout: number,
) {
  for (let i = 0; i < timeout; i++) {
    const result = await call();
    if (result) {
      return result;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  return null;
}

let token: string | null = null;
export const getTrpcClient = async (): Promise<TRPCClient<AppRouter>> => {
  const client = createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `${config.BASE_URL}/trpc`,
        headers() {
          return {
            authorization: `${token}`,
          };
        },
      }),
    ],
  });

  try {
    if (!token) {
      throw new Error("token is null");
    }
    const payload = await decodeJwt(token);
    if (payload?.exp && payload.exp < Date.now() / 1000) {
      throw new Error("token expired");
    }
    if (!payload?.uuid) {
      throw new Error("uuid is null");
    }
  } catch (e) {
    console.error(e);
    const uuid = uuidv4();
    open(`${config.BASE_URL}/connect?connectId=${uuid}`);
    token = await poolAndWaitting(
      () => client.connect.mutate({ uuid: uuid! }),
      60 * 10,
    );
  }

  return client;
};
