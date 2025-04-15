"use client";
import SuccessAndClose from "@/components/sucess";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useWallet } from "@/hooks/use-wallet";
import { getStorage, setStorage, storageKeySchema } from "@/lib/storage";
import { trpc } from "@/lib/trpc";
import { buildConnectMessage, isTpExtensionInstall } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { ChevronDown, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export default function Connect() {
  const { wallet, connect } = useWallet({
    network: "solana",
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [walletConnect, setWalletConnect] = useState<boolean>(false);

  const { localMsg, walletType } = useMemo(() => {
    const msg = getStorage(storageKeySchema.enum.connect_message);
    const walletType = getStorage(storageKeySchema.enum.wallet_type);
    if (!msg) {
      return {
        localMsg: null,
        walletType: walletType ?? null,
      };
    }
    return {
      localMsg: JSON.parse(msg),
      walletType: walletType ?? null,
    };
  }, []);

  const {
    data: isInitSolanaWallet,
    isLoading,
    refetch,
  } = trpc.getWallet.useQuery({
    network: "solana",
  });

  const trpcUtils = trpc.useUtils();

  const { mutate: signMessage, isPending: isSigning } = useMutation({
    mutationKey: ["signMessage", wallet?.currAddress],
    mutationFn: async () => {
      if (!wallet?.currAddress) {
        throw new Error("Wallet not initialized");
      }
      const message = await buildConnectMessage(wallet.currAddress);

      const signature = await wallet?.signMessage(message);
      if (!signature) {
        throw new Error("Failed to sign message");
      }

      const data = {
        network: "solana" as const,
        address: wallet.currAddress,
        signature,
        message,
      };

      const result = await trpcUtils.client.initWallet.mutate(data);

      setStorage(storageKeySchema.enum.connect_message, JSON.stringify(data));

      setStorage(storageKeySchema.enum.wallet_type, wallet.type);

      await refetch();
      return result;
    },
  });

  useEffect(() => {
    console.log("wallet", wallet);
    if (!wallet?.isConnected() || !wallet?.currAddress || !walletConnect) {
      return;
    }
    signMessage();
  }, [wallet?.isConnected, wallet?.currAddress, signMessage, walletConnect]);

  useEffect(() => {
    const init = async () => {
      console.log(localMsg, walletType);
      if (localMsg) {
        await trpcUtils.client.initWallet.mutate(localMsg);
        await refetch();
      }
      if (walletType === "tp") {
        await connect("tp");
        setWalletConnect(true);
      }
    };
    init();
  }, [localMsg, walletType, trpcUtils.client.initWallet.mutate, refetch]);

  const handleTpClick = async () => {
    if (!isTpExtensionInstall()) {
      globalThis.open("https://extension.tokenpocket.pro/#/", "_blank");
      return;
    }

    if (!window.tokenpocket?.solana) {
      return;
    }

    console.log(" tp click");

    await connect("tp");
    console.log(" tp connect");

    console.log(wallet)
    console.log(wallet?.isConnected())

    setWalletConnect(true);
  };

  const handleWalletConnectClick = async () => {
    if (wallet?.isConnected() && wallet?.type === "wc") {
      await signMessage();
      return;
    }

    await connect("wc");
    setWalletConnect(true);
  };

  if (isLoading || wallet?.pending) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  if (isInitSolanaWallet) {
    if (showSuccess) {
      return (
        <SuccessAndClose
          title="Wallet Connected"
          description={`Your wallet (${isInitSolanaWallet.address.slice(0, 6)}...${isInitSolanaWallet.address.slice(-4)}) is successfully connected to ${isInitSolanaWallet.network.toUpperCase()}`}
        />
      );
    }

    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Wallet Connected</h1>
            <div className="flex items-center justify-center mb-2">
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                {isInitSolanaWallet.network.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex flex-col gap-2">
                <div className="text-sm text-gray-500">Connected Address</div>
                <div className="font-mono text-sm break-all">
                  {isInitSolanaWallet.address}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  // Reset wallet connection
                  setStorage(storageKeySchema.enum.connect_message, "");
                  refetch();
                }}
              >
                Switch Wallet
              </Button>

              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  setShowSuccess(true);
                }}
              >
                Confirm
              </Button>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-gray-500">
            Your wallet is now connected to the application
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
      {isSigning && (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black/50">
          <Loader2 className="w-10 h-10 animate-spin" />
        </div>
      )}
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Connect Your Wallet</h1>
          <p className="text-gray-600 mb-2">
            Your secure crypto wallet to explore blockchain
          </p>
          <p className="text-sm text-gray-500">
            Easy and safe to buy, store, send, swap tokens and collect NFTs
          </p>
        </div>

        <div className="space-y-6 ">
          <div className="w-full flex justify-center">
            <Button
              className=" flex items-center justify-center space-x-3  py-2 h-fit  text-lg bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer"
              onClick={handleTpClick}
            >
              <div className="flex flex-col items-center  justify-center">
                <img
                  src="/tp-logo.png"
                  alt="TokenPocket"
                  className=" w-[160] h-[90px] object-cover "
                />
                <span className="text-xs text-blue-100">Recommended</span>
              </div>
            </Button>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <Collapsible className="w-full">
              <CollapsibleTrigger className="w-full flex items-center justify-center text-gray-600 hover:text-gray-800">
                <span className="text-sm cursor-pointer">More Options</span>
                <ChevronDown className="h-4 w-4 ml-1" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <Button
                  className="w-full h-12 mt-4 flex items-center justify-center space-x-2   text-gray-700 cursor-pointer"
                  variant="outline"
                  onClick={handleWalletConnectClick}
                >
                  <span>WalletConnect</span>
                </Button>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-4 text-center text-sm">
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="font-semibold text-blue-600">Security</div>
            <p className="text-gray-600 text-xs mt-1">
              Full control of your assets
            </p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="font-semibold text-blue-600">30M+</div>
            <p className="text-gray-600 text-xs mt-1">Global users</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="font-semibold text-blue-600">Multi-chain</div>
            <p className="text-gray-600 text-xs mt-1">Support major networks</p>
          </div>
        </div>
      </div>
    </div>
  );
}
