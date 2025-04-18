import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter, createContext } from "@mcp/trpc";
import type { NextRequest } from "next/server";

function handler(req: Request) {
  // Check if it's an OPTIONS request (preflight)
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  return fetchRequestHandler({
    endpoint: "/trpc",
    req,
    router: appRouter,
    createContext: async (req) => {
      const token = req.req.headers.get("authorization");
      return createContext(token);
    },
    onError: (opts) => {
      console.error(opts.error);
      return new Response("Internal Server Error", {
        status: 500,
      });
    },
    responseMeta: () => {
      return {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      };
    },
  });
}
export { handler as GET, handler as POST, handler as OPTIONS };
