"use client";
import { storageKeySchema, useTokenState } from "@/lib/storage";
import { getStorage } from "@/lib/storage";
import { trpc } from "@/lib/trpc";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { useMemo, useState } from "react";

export function TrpcProvider({ children }: { children: React.ReactNode }) {
  const [token] = useTokenState();
  const [queryClient] = useState(() => new QueryClient());
  const trpcClient = useMemo(
    () =>
      trpc.createClient({
        links: [
          httpBatchLink({
            url: "/trpc",
            headers: () => {
              return {
                Authorization: `${token}`,
              };
            },
          }),
        ],
      }),
    [token],
  );
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
