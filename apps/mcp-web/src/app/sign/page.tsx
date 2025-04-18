"use client";
import SuccessAndClose from "@/components/sucess";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/use-wallet";
import { trpc } from "@/lib/trpc";
import { tryDecodeHex } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { Copy, Loader2, PenSquare, XCircle, AlertCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
// Component to handle the search parameters
function SignContent() {
  const params = useSearchParams();
  const router = useRouter();
  const id = params?.get("id");
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
      console.log("signMessage", signData);
      try {
        if (!signData?.dataHex) return;
        let signature: string | null = null;
        if (signData.type === "transaction") {
          const signedTx = await wallet?.signTransaction?.(signData.dataHex);
          signature = signedTx ?? null;
        } else {
          console.log("signMessage", signData.dataHex);
          const signedMessage = await wallet?.signMessage?.(signData.dataHex);
          signature = signedMessage ?? null;
        }

        if (!signature) return;

        let txHash = null;
        if (signData.type === "transaction") {
          txHash = await trpcUtils.client.sendTransaction.mutate({
            signedDataHex: signature,
          });
        }

        console.log("submitSignedData", signData.id, signature, txHash);
        const result = await trpcUtils.client.submitSignedData.mutate({
          id: signData.id,
          signedDataHex: signature,
          txHash,
        });

        return result;
      } catch (e) {
        console.log(e);
        toast.error(`${JSON.stringify(e)}`);
        throw e;
      }
    },
    onSuccess: () => {
      router.push("/connect?tab=history");
    },
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    console.log("useEffect", wallet?.isConnected?.(), wallet?.currAddress);
    if (
      wallet?.isConnected?.() &&
      wallet?.currAddress &&
      signData?.dataHex &&
      !signData?.signedDataHex
    ) {
      signMessage();
    }
  }, [
    wallet?.isConnected?.(),
    wallet?.currAddress,
    signData?.dataHex,
    signData?.signedDataHex,
  ]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard", {
      duration: 2000,
      position: "bottom-right",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center  min-h-[calc(100vh-68px)] ">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Loading signature request...
          </p>
        </div>
      </div>
    );
  }

  if (!signData) {
    return (
      <div className="flex flex-col items-center justify-center  min-h-[calc(100vh-68px)]  ">
        <div className="p-4 bg-white dark:bg-gray-800 rounded-full shadow-sm">
          <XCircle className="w-16 h-16 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Invalid Signing Request
        </h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-md text-center">
          The requested signing data was not found or has expired.
        </p>
        <Button
          variant="outline"
          onClick={() => window.history.back()}
          className="mt-4"
        >
          Go Back
        </Button>
      </div>
    );
  }

  // if (signData?.signedDataHex) {
  //   return (
  //     <SuccessAndClose
  //       title="Signature Confirmed"
  //       description="Your transaction has been successfully signed and submitted"
  //     />
  //   );
  // }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-68px)] ">
      <div
        key={signData.id}
        className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow-lg overflow-hidden max-w-md w-full transition-all hover:shadow-xl"
      >
        <div className="p-6 border-b dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 dark:bg-blue-900 rounded-full">
              <PenSquare className="h-5 w-5 text-blue-600 dark:text-blue-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Signature Request
            </h3>
          </div>
          {signData.network && (
            <div className="mt-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                {signData.network}
              </span>
            </div>
          )}
        </div>

        <div className="px-6 py-5 space-y-5">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Wallet Address
              </span>
              <button
                onClick={() => handleCopy(signData.address)}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                type="button"
                aria-label="Copy address"
              >
                <Copy className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border dark:border-gray-700">
              <span className="font-mono text-xs text-gray-800 dark:text-gray-200 break-all">
                {signData.address}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            {signData.type && (
              <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400 text-xs block mb-1">
                  Type
                </span>
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {signData.type}
                </span>
              </div>
            )}
            {signData.createdAt && (
              <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400 text-xs block mb-1">
                  Created
                </span>
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {new Date(signData.createdAt).toLocaleString()}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Content to Sign
              </span>
              <button
                onClick={() => handleCopy(signData.dataHex)}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                type="button"
                aria-label="Copy data"
              >
                <Copy className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
              {tryDecodeHex(signData.dataHex) ? (
                <div className="p-4 bg-white dark:bg-gray-800">
                  <div className="text-sm text-gray-800 dark:text-gray-200 break-words">
                    {tryDecodeHex(signData.dataHex)}
                  </div>
                  <button
                    onClick={() => handleCopy(signData.dataHex)}
                    className="mt-3 text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    type="button"
                    aria-label="Copy data"
                  >
                    <span>View raw hex</span>
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 dark:bg-gray-900">
                  <div className="font-mono text-xs text-gray-800 dark:text-gray-200 break-all max-h-24 overflow-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                    {signData.dataHex}
                  </div>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">Signing failed</p>
                <p className="text-xs mt-1 text-red-600 dark:text-red-400">
                  {error.message || "Please try again"}
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              size="default"
              onClick={() => window.close()}
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              size="default"
              onClick={() => signMessage()}
              disabled={isSigning}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5"
            >
              {isSigning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Signing...
                </>
              ) : (
                <>
                  <PenSquare className="h-4 w-4 mr-2" />
                  {signData.type === "transaction" ? "Sign And Send Transaction" : "Sign Message"}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SignLoading() {
  return (
    <div className="flex items-center justify-center  min-h-[calc(100vh-68px)]  ">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
          Loading signature request...
        </p>
      </div>
    </div>
  );
}

export default function SignPage() {
  return (
    <Suspense fallback={<SignLoading />}>
      <SignContent />
    </Suspense>
  );
}
