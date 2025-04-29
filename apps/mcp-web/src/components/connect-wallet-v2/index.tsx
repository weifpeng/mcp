"use client";

import { Wallet } from "lucide-react";
import { Button } from "../ui/button";

import { useSnapshot } from "valtio";
import { dataStore, setModelOpen } from "./store";

export function ConnectWallet({
  children,
  defaultOpen,
}: { children?: React.ReactNode; defaultOpen?: boolean }) {
  const { wallet, connectInfo } = useSnapshot(dataStore);

  const handleConnect = async () => {
    setModelOpen(true);
    return;
  };

  return (
    <>
      {children && <div onClick={handleConnect}>{children}</div>}
      {!children && (
        <Button
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={handleConnect}
        >
          <Wallet className="h-4 w-4 mr-2" />
          {wallet?.address
            ? `${wallet.address.slice(0, 4)}...${wallet.address.slice(-4)}`
            : "Connect Wallet"}
        </Button>
      )}
    </>
  );
}
