"use client";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { isTpExtensionInstall } from "@/lib/utils";
import { ChevronDown, Copy, Loader2, Wallet } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

interface WalletConnectionOptionsProps {
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  handleTpClick: (network: "solana" | "evm") => Promise<void>;
  handleWalletConnectClick: () => Promise<void>;
}

export function WalletConnectionOptions({
  isLoading,
  setIsLoading,
  handleTpClick,
  handleWalletConnectClick,
}: WalletConnectionOptionsProps) {
  if (isLoading) {
    return (
      <>
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          <span className="ml-2 text-gray-600">Connecting wallet...</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setIsLoading(false);
          }}
          className="mt-4"
        >
          Cancel
        </Button>
      </>
    );
  }

  return (
    <div className="flex justify-center items-center flex-col py-6 space-y-6">
      <div className=" w-full flex flex-col items-center rounded-lg p-6 ">
        <div className="relative w-20 h-20 mb-2">
          <Image
            src={"/tp-logo.svg"}
            fill
            alt="TokenPocket"
            className="object-contain"
          />
        </div>
        <h1 className="text-lg font-bold">TokenPocket</h1>
        <span className="text-xs text-blue-600 mt-1">Recommended</span>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Best wallet for multiple networks with robust security and features
        </p>

        {!isTpExtensionInstall() && (
          <div className="mt-4 text-center text-xs text-gray-500">
            <a
              href="https://extension.tokenpocket.pro/#/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              Install TokenPocket extension
            </a>{" "}
            if not already installed
          </div>
        )}
      </div>

      <div className="w-full flex flex-col gap-3">
        <Button
          className="w-full rounded-xl py-7 px-2 bg-neutral-100 hover:bg-neutral-200/80  "
          variant="ghost"
          onClick={() => handleTpClick("evm")}
        >
          <div className=" flex justify-start gap-2 w-full items-center">
            <Image
              src="/evm-logo.webp"
              alt="EVM Networks"
              className=" rounded-xl"
              width={40}
              height={40}
            />
            EVM Networks
          </div>
        </Button>

        <Button
          className="w-full rounded-xl py-7 px-2 bg-neutral-100 hover:bg-neutral-200/80  "
          variant="ghost"
          onClick={() => handleTpClick("solana")}
        >
          <div className=" flex justify-start gap-2 w-full items-center">
            <Image
              src="/solana-logo.webp"
              alt="Solana"
              className=" rounded-xl"
              width={40}
              height={40}
            />
            Solana
          </div>
        </Button>
      </div>

      {/* Hidden WalletConnect Option */}
      <div className="w-full border-t border-gray-200 pt-2">
        <Collapsible className="w-full">
          <CollapsibleTrigger className="w-full flex items-center justify-center text-gray-500 hover:text-gray-700 py-2">
            <span className="text-xs">More Wallet Options</span>
            <ChevronDown className="h-3 w-3 ml-1" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div
              className="w-full mt-2 p-4 rounded-lg bg-gray-50 flex flex-col items-center cursor-pointer hover:bg-gray-100 border border-gray-200"
              onClick={handleWalletConnectClick}
            >
              <span className="text-sm font-medium text-gray-700">
                WalletConnect
              </span>
              <p className="text-xs text-gray-500 mt-1 text-center">
                Connect with any WalletConnect compatible wallet
              </p>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}

interface WalletInfoProps {
  wallet: {
    currAddress: string | null;
    type?: "tp" | "wc";
  };
  disconnect: () => Promise<void>;
}

export function WalletInfo({ wallet, disconnect }: WalletInfoProps) {
  return (
    <div className="flex flex-col items-center py-6">
      <div className=" w-full flex flex-col items-center rounded-xl p-6 border border-neutral-200 shadow-sm">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <Wallet className="h-8 w-8 text-green-600" />
        </div>

        <span className="font-medium text-lg mb-1">Wallet Connected</span>
        <span className="text-xs text-neutral-500 mb-5">
          {wallet?.type === "tp" ? "TokenPocket" : "WalletConnect"}
        </span>

        <div className="w-full mb-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-500">Address</span>
            <div className="flex items-center">
              <p className="text-sm font-medium font-mono">
                {wallet?.currAddress?.slice(0, 6)}...
                {wallet?.currAddress?.slice(-6)}
              </p>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 ml-1"
                onClick={() => {
                  navigator.clipboard.writeText(wallet?.currAddress || "");
                  toast.success("Address copied to clipboard");
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-500">Network</span>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2" />
              <span className="text-sm font-medium">Solana</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-2 w-full mt-4">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 rounded-lg"
          onClick={disconnect}
        >
          Disconnect
        </Button>
      </div>
    </div>
  );
}
