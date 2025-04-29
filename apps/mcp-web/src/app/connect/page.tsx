"use client";
import {
  callWallet,
  confirmCurrentMessage,
  dataStore,
  initConnecting,
  stateStore,
  useWalletDataStateCurr,
  isWriteMessage,
} from "@/components/connect-wallet-v2/store";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Suspense, use, useEffect, useMemo, useState } from "react";
import { useSnapshot } from "valtio";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ActionDisplay } from "@/components/connect-wallet-v2/action-display";

function Connect(params: { tab?: string }) {
  const { message } = useWalletDataStateCurr();
  const { currentMessage, showMessageDialog, isSigning } =
    useSnapshot(stateStore);
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(
    new Set(),
  );
  const [isNewMessage, setIsNewMessage] = useState(false);
  const router = useRouter();

  const data = useMemo(() => {
    if (!message) return [];
    const data = [...message];
    setIsNewMessage(true);
    setTimeout(() => setIsNewMessage(false), 1000);
    return data.reverse();
  }, [message]);

  const toggleMessage = (id: string) => {
    setExpandedMessages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  useEffect(() => {
    initConnecting();
    return () => {
      dataStore.listenMessage = false;
    };
  }, []);

  const handleConfirmMsg = async () => {
    await confirmCurrentMessage();
  };

  return (
    <div className="px-4 py-6">
      <Dialog
        open={showMessageDialog}
        onOpenChange={() => {
          stateStore.showMessageDialog = false;
        }}
      >
        <DialogContent className="w-fit">
          <DialogHeader>
            <DialogTitle>Message need confirmation</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {currentMessage && <ActionDisplay data={currentMessage} />}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                stateStore.currentMessage = null;
                stateStore.showMessageDialog = false;
                stateStore.isSigning = false;
              }}
              disabled={isSigning}
            >
              Cancle
            </Button>
            <Button onClick={handleConfirmMsg} disabled={isSigning}>
              {isSigning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Confirm...
                </>
              ) : (
                "Confirm"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Third-party App Messages
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            View and manage wallet connection requests from third-party
            applications.
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Messages are only actively monitored while you are on this page.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Total Messages:</span>
            <span className="px-2 py-1 bg-gray-100 rounded-full text-sm font-medium">
              {data.length}
            </span>
          </div>
          <Button
            onClick={() => {
              router.push("/connect/active");
            }}
          >
            View Active Connections
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {data.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12 bg-white rounded-lg border border-gray-200"
          >
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Active Connections
            </h3>
            <p className="text-sm text-gray-500 text-center max-w-md mb-4">
              You don't have any active connections with third-party
              applications. When applications request to connect with your
              wallet, their messages will appear here.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>
                Stay on this page to actively monitor incoming requests
              </span>
            </div>
          </motion.div>
        ) : (
          <AnimatePresence>
            {data.map((msg, index) => (
              <motion.div
                key={`${msg.id}`}
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.1,
                  ease: [0.4, 0, 0.2, 1],
                }}
                className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors duration-200"
              >
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => toggleMessage(msg.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-500 font-medium">
                          {msg.method.split("_")[1]?.[0] || "?"}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {msg.method.replace("_", " ")}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(msg.createdAt || "").toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {msg.status === "pending" &&
                        msg.decryptReq &&
                        isWriteMessage({
                          network: msg.decryptReq.network,
                          method: msg.decryptReq.data.method,
                        }) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              stateStore.currentMessage = msg;
                              stateStore.isSigning = false;
                              stateStore.showMessageDialog = true;
                            }}
                          >
                            Confirm
                          </Button>
                        )}
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          msg.status === "success"
                            ? "bg-green-100 text-green-800"
                            : msg.status === "error"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {msg.status}
                      </span>

                      <ChevronDown
                        className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                          expandedMessages.has(msg.id) ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {expandedMessages.has(msg.id) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-gray-100 overflow-hidden"
                  >
                    <div className="p-4">
                      <div className="grid gap-4">
                        <div className="flex items-center">
                          <span className="font-medium w-28 text-gray-600">
                            Method:
                          </span>
                          <span className="text-gray-800 font-mono bg-gray-50 px-3 py-1 rounded-md border border-gray-200">
                            {msg.method}
                          </span>
                        </div>

                        {msg.decryptReq && (
                          <div>
                            <div className="font-medium text-gray-600 mb-2">
                              Request Details
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                              <div className="grid gap-3">
                                <div className="flex items-center">
                                  <span className="w-24 text-gray-600">
                                    Network:
                                  </span>
                                  <span className="font-medium">
                                    {msg.decryptReq.network}
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <span className="w-24 text-gray-600">
                                    Chain ID:
                                  </span>
                                  <span className="font-medium">
                                    {msg.decryptReq.chainId}
                                  </span>
                                </div>
                                {msg.decryptReq.data && (
                                  <div>
                                    <span className="w-24 text-gray-600">
                                      Data:
                                    </span>
                                    <pre className="mt-2 bg-white p-3 rounded border border-gray-200 overflow-auto text-sm">
                                      {JSON.stringify(
                                        msg.decryptReq.data,
                                        null,
                                        2,
                                      )}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {msg.decryptRes && (
                          <div>
                            <div className="font-medium text-gray-600 mb-2">
                              Response
                            </div>
                            <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm max-h-48 border border-gray-200">
                              {JSON.stringify(msg.decryptRes, null, 2)}
                            </pre>
                          </div>
                        )}

                        {msg.error && (
                          <div>
                            <div className="font-medium text-gray-600 mb-2">
                              Error Details
                            </div>
                            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                              <p className="text-red-800 text-sm">
                                {msg.error}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
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
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = use(searchParams);

  return (
    <Suspense fallback={<ConnectLoading />}>
      <Connect tab={tab} />
    </Suspense>
  );
}
