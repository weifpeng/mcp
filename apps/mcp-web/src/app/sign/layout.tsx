"use client";

import { Button } from "@/components/ui/button";
import { useAppContext } from "@/hooks/use-app-context";
import { useTokenState } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { Loader2, WalletIcon } from "lucide-react";
import { useState } from "react";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [token] = useTokenState();
  const { setOpenConnectModal } = useAppContext();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = () => {
    setIsConnecting(true);
    setOpenConnectModal(true);
  };

  if (!token) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center p-6 max-w-lg mx-auto text-center h-[calc(100vh-68px)]",
        )}
      >
        <h1 className="text-2xl font-bold mb-4 flex items-center justify-center gap-2">
          <WalletIcon className="h-6 w-6" />
          Connect Wallet
        </h1>

        <p className="text-gray-600 mb-8">
          Connect your wallet to access and use our tools. A secure wallet
          connection is required to interact with blockchain features.
        </p>
        <Button
          size="lg"
          className="w-full max-w-xs"
          onClick={handleConnect}
          disabled={isConnecting}
        >
          {isConnecting ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Connecting wallet...
            </>
          ) : (
            <>
              <WalletIcon className="h-5 w-5 mr-2" />
              Connect Wallet
            </>
          )}
        </Button>
      </div>
    );
  }
  return <>{children}</>;
}
