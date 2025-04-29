"use client";
import {
  addConnect,
  removeListen,
  useWalletDataStateCurr,
} from "@/components/connect-wallet-v2/store";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { trpc } from "@/lib/trpc";
import { AlertCircle, Info, Key, Link2, Shield, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { motion } from "framer-motion";

interface ITopicPageProps {
  searchParams: Promise<{ key: string; topic: string }>;
}

export default function TopicPage(props: ITopicPageProps) {
  const { key, topic } = use(props.searchParams);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [showIpMismatchDialog, setShowIpMismatchDialog] = useState(false);
  const data = useWalletDataStateCurr();
  const connectedTopics = data.connectInfo;

  const { data: connInfo, isLoading: isLoadingConnInfo } =
    trpc.conn.info.useQuery({ topic }, { enabled: !!topic });

  useEffect(() => {
    if (topic && key) {
      setShowRequestDialog(true);
    }
  }, [topic, key]);

  const handleApprove = () => {
    if (!topic || !key) return;

    if (connInfo?.topicIp && connInfo.topicIp !== connInfo.clientIp) {
      setShowIpMismatchDialog(true);
      return;
    }

    setIsLoading(true);
    addConnect({
      topic,
      key,
      topicIp: connInfo?.topicIp || null,
    });
    setShowRequestDialog(false);
    router.push("/connect");
  };

  const handleConfirmIpMismatch = () => {
    setIsLoading(true);
    addConnect({
      topic,
      key,
      topicIp: connInfo?.topicIp || null,
    });
    setShowIpMismatchDialog(false);
    setShowRequestDialog(false);
    router.push("/connect");
  };

  const handleRemoveConnection = (topicId: string) => {
    removeListen(topicId);
  };

  return (
    <div className="min-h-[calc(100vh-70px)] py-6 sm:py-8 px-4 bg-gradient-to-b from-background to-muted/10">
      <div className=" mx-auto">
        <div className="flex items-center space-x-4 mb-8">
          <div className="rounded-full bg-primary/5 p-2.5">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Active Connections
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Applications that can interact with your wallet
            </p>
          </div>
          <Button
            variant="outline"
            className="ml-auto"
            onClick={() => router.push("/connect")}
          >
            View Messages
          </Button>
        </div>

        <div className="space-y-6">
          <div className="  space-y-3">
            {Object.entries(connectedTopics).map(([topicId, info]) => (
              <div
                key={topicId}
                className="flex items-center justify-between p-4 rounded-lg border border-border/40 bg-card/50 hover:bg-muted/30 transition-colors cursor-pointer"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{topicId}</span>
                    <Badge
                      variant="outline"
                      className="bg-primary/5 text-primary/80 border-primary/10 text-xs"
                    >
                      Connected
                    </Badge>
                  </div>
                  {info && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Connected on {info.date}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <div className="rounded-full bg-muted/30 p-1">
                          <Link2 className="h-3 w-3" />
                        </div>
                        <span>IP: {info.topicIp || "unknown"}</span>
                      </div>
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                  onClick={() => handleRemoveConnection(topicId)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {Object.keys(connectedTopics).length === 0 && (
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
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Active Connections
                </h3>
                <p className="text-sm text-gray-500 text-center max-w-md mb-4">
                  You haven't established any connections with third-party
                  applications yet. When you approve connection requests, they
                  will appear here.
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
                  <span>View connection requests in the Messages tab</span>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-xl">
              New Connection Request
            </DialogTitle>
            <DialogDescription className="text-sm">
              A third-party application wants to interact with your wallet.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <Alert
              variant="destructive"
              className="border-destructive/40 bg-destructive/5"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-medium mb-1">Security Warning</p>
                <p className="text-sm">
                  Only approve connections from trusted sources that you can
                  verify. Be cautious of unknown or suspicious links.
                </p>
              </AlertDescription>
            </Alert>

            <div className="space-y-4 rounded-lg border border-border/40 bg-card/50 p-5">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <div className="rounded-full bg-muted/30 p-1.5">
                  <Info className="h-3.5 w-3.5" />
                </div>
                <span>Connection Details</span>
              </div>

              <div className="grid gap-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium flex items-center">
                      <span className="mr-2">Connection ID</span>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2"
                          >
                            <Link2 className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-[300px] break-all">{topic}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="p-3 bg-muted/20 rounded-md text-sm break-all border border-border/40">
                    {topic}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium flex items-center">
                      <span className="mr-2">Security Key</span>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2"
                          >
                            <Key className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-[300px] break-all">{key}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="p-3 bg-muted/20 rounded-md text-sm break-all border border-border/40">
                    {key}
                  </div>
                </div>

                {connInfo && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium flex items-center">
                        <span className="mr-2">IP Information</span>
                      </div>
                    </div>
                    <div
                      className={`p-3 rounded-md text-sm break-all border ${
                        connInfo.topicIp &&
                        connInfo.topicIp !== connInfo.clientIp
                          ? "bg-destructive/5 border-destructive/40"
                          : "bg-muted/20 border-border/40"
                      }`}
                    >
                      <div className="space-y-2">
                        <div>
                          <span className="text-muted-foreground">
                            Topic IP:{" "}
                          </span>
                          <span
                            className={
                              connInfo.topicIp &&
                              connInfo.topicIp !== connInfo.clientIp
                                ? "text-destructive font-medium"
                                : ""
                            }
                          >
                            {connInfo.topicIp || "Not available"}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Your IP:{" "}
                          </span>
                          <span>{connInfo.clientIp}</span>
                        </div>
                        {connInfo.topicIp &&
                          connInfo.topicIp !== connInfo.clientIp && (
                            <div className="text-destructive text-sm mt-2">
                              Warning: Topic IP and Client IP do not match. This
                              could indicate a potential security risk.
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowRequestDialog(false);
                router.push("/connect/active");
              }}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleApprove}
              disabled={isLoading || isLoadingConnInfo}
              className="gap-2 w-full sm:w-auto"
            >
              <Key className="h-4 w-4" />
              {isLoading ? "Connecting..." : "Allow Connection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showIpMismatchDialog}
        onOpenChange={setShowIpMismatchDialog}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-xl">
              IP Address Mismatch Warning
            </DialogTitle>
            <DialogDescription className="text-sm">
              The connection request shows different IP addresses for the topic
              and your client.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <Alert
              variant="destructive"
              className="border-destructive/40 bg-destructive/5"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-medium mb-1">Security Warning</p>
                <p className="text-sm">
                  The IP address of the connection request ({connInfo?.topicIp})
                  does not match your current IP address ({connInfo?.clientIp}).
                  This could indicate a potential security risk or that the
                  connection request is coming from a different location.
                </p>
              </AlertDescription>
            </Alert>

            <div className="space-y-4 rounded-lg border border-border/40 bg-card/50 p-5">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <div className="rounded-full bg-muted/30 p-1.5">
                  <Info className="h-3.5 w-3.5" />
                </div>
                <span>Connection Details</span>
              </div>

              <div className="grid gap-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium">Topic IP</div>
                  </div>
                  <div className="p-3 bg-destructive/5 rounded-md text-sm break-all border border-destructive/40">
                    {connInfo?.topicIp}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium">Your IP</div>
                  </div>
                  <div className="p-3 bg-muted/20 rounded-md text-sm break-all border border-border/40">
                    {connInfo?.clientIp}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowIpMismatchDialog(false);
                setShowRequestDialog(false);
              }}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmIpMismatch}
              disabled={isLoading}
              className="gap-2 w-full sm:w-auto"
            >
              <Key className="h-4 w-4" />
              {isLoading ? "Connecting..." : "Proceed Anyway"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
