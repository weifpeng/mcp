"use client";
import SuccessAndClose from "@/components/sucess";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useWallet } from "@/hooks/use-wallet";
import { storageKeySchema } from "@/lib/storage";
import { getStorage } from "@/lib/storage";
import { trpc } from "@/lib/trpc";
import { useMutation } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Loader2,
  XCircle,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function SignPage() {
  const param = useSearchParams();
  const id = param.get("id");
  const [isSigningInProgress, setIsSigningInProgress] = useState(false);
  const [signError, setSignError] = useState<string | null>(null);
  const [signSuccess, setSignSuccess] = useState(false);

  const {
    data: signData,
    isLoading,
    refetch,
  } = trpc.getSignData.useQuery(
    {
      id: id ?? "",
    },
    {
      enabled: Boolean(id),
    },
  );

  const { wallet, connect } = useWallet({
    address: signData?.address ?? "",
    network: "solana",
  });

  const trpcUtils = trpc.useUtils();

  const {
    mutate: signMessage,
    isPending: isSigning,
    isSuccess,
    error,
  } = useMutation({
    mutationKey: ["signMessage", wallet?.currAddress],
    mutationFn: async () => {
      console.log("signMessage");
      try {
        if (!signData?.dataHex) return;
        let signature: string | null = null;
        if (signData.type === "transaction") {
          const signedTx = await wallet?.signTransaction(signData.dataHex);

          signature = signedTx ?? null;
        } else {
          const signedMessage = await wallet?.signMessage(signData.dataHex);
          signature = signedMessage ?? null;
        }

        if (!signature) return;

        let txHash = null;
        if (signData.type === "transaction") {
          txHash = await trpcUtils.client.sendTransaction.mutate({
            signedDataHex: signature,
          });
        }

        const result = await trpcUtils.client.submitSignedData.mutate({
          id: signData.id,
          signedDataHex: signature,
          txHash,
        });
        console.log(result);
        await refetch();
        return result;
      } catch (e) {
        console.log(e);
        toast.error(`${JSON.stringify(e)}`);
        throw e;
      }
    },
  });

  useEffect(() => {
    const walletType = getStorage(storageKeySchema.enum.wallet_type);
    if (walletType === "tp") {
      connect("tp");
    }
  }, [connect]);

  const handleTpClick = async () => {
    connect("tp");
  };

  const handleWalletConnectClick = () => {
    connect("wc");
  };

  const handleSignMessage = async () => {
    await signMessage();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  if (!signData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <XCircle className="w-16 h-16 text-red-500" />
        <h1 className="text-2xl font-bold">Invalid Signing Request</h1>
        <p className="text-gray-500">
          The requested signing data was not found.
        </p>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <SuccessAndClose
        title="signing success"
        description="signing success, enjoy it"
      />
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold">
              {signData.type === "transaction"
                ? "Sign Transaction"
                : "Sign Message"}
            </CardTitle>
            <Badge
              variant={
                signData.type === "transaction" ? "default" : "secondary"
              }
            >
              {signData.network.toUpperCase()}
            </Badge>
          </div>
          <CardDescription>
            {signData.type === "transaction"
              ? "You are about to sign a transaction on the blockchain"
              : "You are about to sign a message with your wallet"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="p-4 mb-4 bg-gray-100 rounded-lg dark:bg-gray-800">
            {signData.type === "message" && (
              <>
                <div className="flex items-center mb-2">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Message:
                  </span>
                </div>
                <p className="break-all text-xs">
                  {Buffer.from(signData.dataHex, "hex").toString("utf-8")}
                </p>
              </>
            )}
            {signData.type === "transaction" && (
              <>
                <div className="flex items-center mb-2">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Transaction Hex:
                  </span>
                </div>
                <p className="break-all text-xs">{signData.dataHex}</p>
              </>
            )}
          </div>

          {signError && (
            <div className="p-3 mb-4 text-sm text-red-800 bg-red-100 rounded-lg dark:bg-red-900/50 dark:text-red-300">
              <div className="flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2" />
                <span>Error: {signError}</span>
              </div>
            </div>
          )}

          {signSuccess && (
            <div className="p-3 mb-4 text-sm text-green-800 bg-green-100 rounded-lg dark:bg-green-900/50 dark:text-green-300">
              <div className="flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                <span>Successfully signed!</span>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          {wallet?.pending && (
            <div className="flex items-center justify-center w-full">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              <span>Loading</span>
            </div>
          )}
          {!wallet?.pending && !wallet?.isConnected() && (
            <div className="space-y-6 w-full ">
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
          )}

          {!wallet?.pending && wallet?.isConnected() && (
            <Button
              className="w-full h-12 flex items-center justify-center space-x-2   text-white cursor-pointer"
              variant="default"
              onClick={handleSignMessage}
              disabled={isSigning}
            >
              {isSigning ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                "Sign"
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
