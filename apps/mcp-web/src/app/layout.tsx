"use client";
import { Toaster } from "@/components/ui/sonner";
import { TrpcProvider } from "@/context/trpc";
import "./globals.css";

import WalletConnectProvider from "@/context/wallet-connect";
import { RootLayout } from "@/components/root-layout";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <WalletConnectProvider>
          <TrpcProvider>
            <RootLayout>{children}</RootLayout>
            <Toaster position="top-right" />
          </TrpcProvider>
        </WalletConnectProvider>
      </body>
    </html>
  );
}
