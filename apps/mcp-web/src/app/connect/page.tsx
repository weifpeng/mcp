"use client";
import { ConnectWallet } from "@/components/connect-wallet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWallet } from "@/hooks/use-wallet";
import {
  setConnectId,
  getConnectId,
  useTokenState,
  clearAll,
} from "@/lib/storage";
import { trpc } from "@/lib/trpc";
import {
  Copy,
  ExternalLink,
  FileSignature,
  Inbox,
  Loader2,
  PenSquare,
  WalletIcon,
} from "lucide-react";
import { Suspense, use, useEffect, useState } from "react";
import { toast } from "sonner";
import { cn, tryDecodeHex } from "@/lib/utils";
import { useAppContext } from "@/hooks/use-app-context";
function Connect(params: { connectId: string; tab?: string }) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [selectedSignData, setSelectedSignData] = useState<string | null>(null);
  const { setOpenConnectModal } = useAppContext();
  const { wallet } = useWallet({});
  const [token, setToken] = useTokenState();
  const { data: signDataList } = trpc.getSignDataList.useQuery(
    { isSigned: false },
    {
      refetchInterval: 3000,
    },
  );

  const { data: signedDataList, refetch } = trpc.getSignDataList.useQuery({
    isSigned: true,
  });

  const submitSignedDataMutation = trpc.submitSignedData.useMutation();

  const handleConnect = () => {
    setIsConnecting(true);
    setOpenConnectModal(true);
  };

  const handleCopyAddress = () => {
    if (wallet.currAddress) {
      navigator.clipboard.writeText(wallet.currAddress);
      toast.success("Wallet address copied to clipboard");
    }
  };

  const handleSignData = async (id: string, dataHex: string) => {
    try {
      setSelectedSignData(id);
      const signedDataHex = await wallet.signMessage?.(dataHex);

      if (signedDataHex) {
        await submitSignedDataMutation.mutate({
          id,
          signedDataHex,
        });
        toast.success("Transaction signed successfully");
      } else {
        toast.error("Failed to sign transaction");
      }
    } catch (error) {
      console.error("Error signing data:", error);
      toast.error("Error signing data");
    } finally {
      setSelectedSignData(null);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (wallet.isConnected?.() && wallet.currAddress && token) {
      setIsConnecting(false);
      setIsConnected(true);
      console.log("connected");
    } else {
      setIsConnected(false);
    }
  }, [wallet.isConnected?.(), wallet.currAddress, token]);

  useEffect(() => {
    if (params.connectId && params.connectId !== getConnectId()) {
      clearAll();
      setConnectId(params.connectId);
    }
  }, [params.connectId]);

  return (
    <>
      <div
        className={cn(
          "flex flex-col p-6   h-[calc(100vh-68px)]",
          !isConnected ? "hidden" : "",
        )}
      >
        <div className="mb-6 border-b pb-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-50 rounded-full mr-4">
              <WalletIcon className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                Wallet Successfully Connected
              </h1>
              <p className="text-gray-600">
                Your wallet is now connected. You can sign transactions below.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Connected Address</span>
            <div className="flex items-center gap-1">
              <button
                onClick={handleCopyAddress}
                className="p-1 hover:bg-gray-200 rounded-md transition-colors"
                aria-label="Copy address"
                type="button"
              >
                <Copy className="h-4 w-4 text-gray-500" />
              </button>
              <a
                href={`https://solscan.io/account/${wallet.currAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 hover:bg-gray-200 rounded-md transition-colors"
                aria-label="View on explorer"
              >
                <ExternalLink className="h-4 w-4 text-gray-500" />
              </a>
            </div>
          </div>
          <div className="font-mono text-sm bg-white p-3 rounded border border-gray-200 break-all">
            {wallet.currAddress}
          </div>
        </div>

        <Tabs defaultValue={params.tab || "inbox"} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="inbox" className="flex items-center gap-2">
              <Inbox className="h-4 w-4" />
              Signature Inbox
              {signDataList && signDataList.length > 0 && (
                <Badge variant="default" className="ml-1 text-white">
                  {signDataList.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="flex items-center gap-2"
              onClick={() => refetch()}
            >
              <FileSignature className="h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inbox" className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">
                Refreshes automatically every 3 seconds
              </p>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Live</span>
              </div>
            </div>

            {!signDataList || signDataList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 border border-dashed rounded-lg bg-gray-50">
                <Inbox className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-500">No pending signatures</p>
              </div>
            ) : (
              <div className="space-y-4">
                {signDataList.map((signData) => (
                  <div
                    key={signData.id}
                    className="bg-white border rounded-lg shadow-sm overflow-hidden"
                  >
                    <div className="p-4 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-50 rounded-full">
                          <PenSquare className="h-4 w-4 text-blue-500" />
                        </div>
                        <h3 className="font-medium">Signature Request</h3>
                      </div>
                    </div>

                    <div className="px-4 pb-4">
                      <div className="flex items-center gap-2 mb-3 p-2 ">
                        <span className="text-xs text-gray-500">Address:</span>
                        <span className="font-mono text-xs truncate flex-1">
                          {signData.address}
                        </span>
                        <button
                          onClick={() =>
                            navigator.clipboard.writeText(signData.address)
                          }
                          className="p-1 hover:bg-gray-100 rounded"
                          type="button"
                          aria-label="Copy address"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
                        {signData.type && (
                          <div className="bg-gray-50 p-2 rounded-md">
                            <span className="text-gray-500 block">Type</span>
                            <span className="font-medium">{signData.type}</span>
                          </div>
                        )}
                        {signData.network && (
                          <div className="bg-gray-50 p-2 rounded-md">
                            <span className="text-gray-500 block">Network</span>
                            <span className="font-medium">
                              {signData.network}
                            </span>
                          </div>
                        )}
                        {signData.createdAt && (
                          <div className="bg-gray-50 p-2 rounded-md">
                            <span className="text-gray-500 block">Created</span>
                            <span className="font-medium">
                              {new Date(signData.createdAt).toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="border rounded-md mb-4 overflow-hidden">
                        <div className="bg-gray-50 px-3 py-2 border-b flex justify-between items-center">
                          <span className="font-medium text-xs">
                            Content to Sign
                          </span>
                          <button
                            onClick={() =>
                              navigator.clipboard.writeText(signData.dataHex)
                            }
                            className="p-1 hover:bg-gray-200 rounded text-gray-500"
                            type="button"
                            aria-label="Copy data"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Try to decode and display if it might be a message */}
                        {tryDecodeHex(signData.dataHex) ? (
                          <div className="p-3">
                            <div className="text-sm font-medium break-words">
                              {tryDecodeHex(signData.dataHex)}
                            </div>
                            <div
                              onClick={() =>
                                navigator.clipboard.writeText(signData.dataHex)
                              }
                              className="text-xs text-gray-500 mt-2 cursor-pointer hover:underline flex items-center gap-1"
                            >
                              <span>Show raw hex</span>
                              <Copy className="h-3 w-3" />
                            </div>
                          </div>
                        ) : (
                          /* Display raw hex if can't decode */
                          <div className="p-3 bg-gray-50">
                            <div className="font-mono text-xs break-all max-h-16 overflow-auto">
                              {signData.dataHex}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className=" flex justify-end">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() =>
                            handleSignData(signData.id, signData.dataHex)
                          }
                          disabled={
                            selectedSignData === signData.id ||
                            submitSignedDataMutation.isPending
                          }
                        >
                          {selectedSignData === signData.id ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Signing...
                            </>
                          ) : (
                            <>
                              <PenSquare className="h-4 w-4 mr-2" />
                              Sign Request
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history">
            {!signedDataList || signedDataList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 border border-dashed rounded-lg bg-gray-50">
                <FileSignature className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-500">No signed transactions yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {signedDataList.map((signData) => (
                  <div
                    key={signData.id}
                    className="bg-white border rounded-lg shadow-sm overflow-hidden"
                  >
                    <div className="p-4 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-green-50 rounded-full">
                          <FileSignature className="h-4 w-4 text-green-500" />
                        </div>
                        <h3 className="font-medium">
                          Signed {signData.type.toUpperCase()}
                        </h3>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200"
                      >
                        Signed
                      </Badge>
                    </div>

                    <div className="px-4 pb-4">
                      <div className="flex items-center gap-2 mb-3 p-2">
                        <span className="text-xs text-gray-500">Address:</span>
                        <span className="font-mono text-xs truncate flex-1">
                          {signData.address}
                        </span>
                        <button
                          onClick={() =>
                            navigator.clipboard.writeText(signData.address)
                          }
                          className="p-1 hover:bg-gray-100 rounded"
                          type="button"
                          aria-label="Copy address"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
                        {signData.type && (
                          <div className="bg-gray-50 p-2 rounded-md">
                            <span className="text-gray-500 block">Type</span>
                            <span className="font-medium">{signData.type}</span>
                          </div>
                        )}
                        {signData.network && (
                          <div className="bg-gray-50 p-2 rounded-md">
                            <span className="text-gray-500 block">Network</span>
                            <span className="font-medium">
                              {signData.network}
                            </span>
                          </div>
                        )}
                        {signData.createdAt && (
                          <div className="bg-gray-50 p-2 rounded-md">
                            <span className="text-gray-500 block">
                              Signed at
                            </span>
                            <span className="font-medium">
                              {new Date(signData.createdAt).toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="border rounded-md mb-4 overflow-hidden">
                        <div className="bg-gray-50 px-3 py-2 border-b flex justify-between items-center">
                          <span className="font-medium text-xs">
                            {tryDecodeHex(signData.dataHex)
                              ? "Message Content"
                              : "Transaction Data"}
                          </span>
                          <button
                            onClick={() =>
                              navigator.clipboard.writeText(signData.dataHex)
                            }
                            className="p-1 hover:bg-gray-200 rounded text-gray-500"
                            type="button"
                            aria-label="Copy data"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>

                        {tryDecodeHex(signData.dataHex) ? (
                          <div className="p-3">
                            <div className="text-sm break-words">
                              {tryDecodeHex(signData.dataHex)}
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 bg-gray-50">
                            <div className="font-mono text-xs break-all max-h-16 overflow-auto">
                              {signData.dataHex}
                            </div>
                          </div>
                        )}
                      </div>

                      {signData.signedDataHex && (
                        <div className="border rounded-md mb-4 overflow-hidden">
                          <div className="bg-gray-50 px-3 py-2 border-b flex justify-between items-center">
                            <span className="font-medium text-xs">
                              Signed {signData.type.toUpperCase()} Hex
                            </span>
                            <button
                              onClick={() =>
                                navigator.clipboard.writeText(
                                  signData.signedDataHex!,
                                )
                              }
                              className="p-1 hover:bg-gray-200 rounded text-gray-500"
                              type="button"
                              aria-label="Copy signed data"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                          </div>
                          <div className="p-3 bg-gray-50">
                            <div className="font-mono text-xs break-all max-h-16 overflow-auto">
                              {signData.signedDataHex}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <Dialog open={clientModalOpen} onOpenChange={setClientModalOpen}>
          <DialogContent className="w-96">
            <DialogTitle>Continue to Client</DialogTitle>
            <DialogDescription>
              You can continue in the client application while waiting. The
              request will be sent to your wallet automatically.
            </DialogDescription>
            <Button
              variant="default"
              className="w-full"
              onClick={() => {
                setClientModalOpen(false);
              }}
            >
              Confirm
            </Button>
          </DialogContent>
        </Dialog>
      </div>
      <div
        className={cn(
          "flex flex-col items-center justify-center p-6 max-w-lg mx-auto text-center h-[calc(100vh-68px)]",
          isConnected ? "hidden" : "",
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
    </>
  );
}

function ConnectLoading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="w-10 h-10 animate-spin" />
    </div>
  );
}

export default function ConnectPage({
  searchParams,
}: {
  searchParams: Promise<{ connectId: string; tab?: string }>;
}) {
  const { connectId, tab } = use(searchParams);

  return (
    <Suspense fallback={<ConnectLoading />}>
      <Connect connectId={connectId} tab={tab} />
    </Suspense>
  );
}
