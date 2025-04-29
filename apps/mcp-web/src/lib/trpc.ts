import type { AppRouter } from "@tokenpocket/trpc";
import { createTRPCReact } from "@trpc/react-query";
import { getToken } from "./storage";
import { httpBatchLink } from "@trpc/client";

export const trpc = createTRPCReact<AppRouter>();

export const getTrpcClient = () => {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: "/trpc",
  
      }),
    ],
  });
};
