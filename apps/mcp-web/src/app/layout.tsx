"use client";
import { Toaster } from "@/components/ui/sonner";
import { TrpcProvider } from "@/context/trpc";
import { Analytics } from "@vercel/analytics/next";

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
      </body>
    </html>
  );
}
