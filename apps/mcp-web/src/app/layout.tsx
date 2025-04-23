"use client";
import { Toaster } from "@/components/ui/sonner";
import { TrpcProvider } from "@/context/trpc";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next"
import "./globals.css";

import WalletConnectProvider from "@/context/wallet-connect";
import { RootLayout } from "@/components/root-layout";
import { AppContextProvider } from "@/context/app-context";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>Wallet MCP</title>
        <meta
          name="description"
          content="The Simplest Way to Interact with Blockchain via Claude"
        />
        <link rel="apple-touch-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" href="/favicon.ico" />
        <link rel="icon" type="image/png" href="/favicon.ico" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <AppContextProvider>
          <WalletConnectProvider>
            <TrpcProvider>
              <RootLayout>{children}</RootLayout>
              <Toaster position="top-right" />
            </TrpcProvider>
          </WalletConnectProvider>
        </AppContextProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
