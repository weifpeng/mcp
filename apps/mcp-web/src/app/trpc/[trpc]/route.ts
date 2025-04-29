import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter, createContext } from "@tokenpocket/trpc";
import { ipAddress } from '@vercel/functions';

export const maxDuration = 60;

function handler(req: Request) {
  return fetchRequestHandler({
    endpoint: "/trpc",
    req,
    router: appRouter,
    createContext: async (req) => {
      const token = req.req.headers.get("authorization");
      const ip = ipAddress(req.req) || 'unknown'
      return createContext(token, ip);
    },
    onError: (opts) => {
      console.error(opts.error);
      return new Response("Internal Server Error", {
        status: 500,
      });
    },
  });
}
export { handler as GET, handler as POST, handler as OPTIONS };
