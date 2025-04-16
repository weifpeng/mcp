import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@mcp/trpc";
function handler(req: Request) {
  return fetchRequestHandler({
    endpoint: "/trpc",
    req,
    router: appRouter,
    createContext: () => ({}),
  });
}
export { handler as GET, handler as POST };
