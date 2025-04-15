"use client";
import { Toaster } from "@/components/ui/sonner";
import { TrpcProvider } from "@/context/trpc";
import "./globals.css";

import WalletConnectProvider from "@/context/wallet-connect";
 
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <WalletConnectProvider>
          <TrpcProvider>
            {children}
            <Toaster position="top-right" />
          </TrpcProvider>
        </WalletConnectProvider>
      </body>
    </html>
  );
}
