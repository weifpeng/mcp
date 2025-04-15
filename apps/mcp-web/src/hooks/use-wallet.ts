import { isTpExtensionInstall } from "@/lib/utils";
import type { Provider } from "@reown/appkit-adapter-solana";
import { useAppKitWallet } from "@reown/appkit-wallet-button/react";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import { VersionedTransaction } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";

interface IWallet {
  currAddress: string | null;
  pending: boolean;
  isConnected: () => boolean;
  getAccount: () => Promise<string>;
  connect: () => Promise<void>;
  signMessage: (message: string) => Promise<string>;
  signTransaction: (transactionHex: string) => Promise<string>;
  type: "tp" | "wc";
}

export const useTpWallet = () => {
  useEffect(() => {
    if (!window.tokenpocket?.solana.isConnected) return;
  }, []);

  const {
    data: currAddress,
    isLoading: pending,
    refetch,
  } = useQuery({
    queryKey: ["tp-wallet"],
    queryFn: async () => {
      if (!isTpExtensionInstall) return "";
      if (!window.tokenpocket?.solana.isConnected) return null;
      const address = await window.tokenpocket.solana.getAccount();
      return address;
    },
  });

  return {
    currAddress,
    pending,
    isConnected: () => {
      if (!isTpExtensionInstall()) {
        return false;
      }
      return window.tokenpocket?.solana.isConnected;
    },
    getAccount: async () => {
      if (!isTpExtensionInstall()) {
        return "";
      }
      return window.tokenpocket?.solana.getAccount();
    },
    connect: async () => {
      if (!isTpExtensionInstall()) {
        return;
      }
      await window.tokenpocket?.solana.connect();
      await refetch();
    },
    signMessage: async (message: string) => {
      if (!isTpExtensionInstall()) {
        return "";
      }

      const data = await window.tokenpocket?.solana.signMessage(
        new TextEncoder().encode(message),
      );
      if (!data) return "";
      return Buffer.from(data.signature).toString("hex");
    },
    signTransaction: async (transactionHex: string) => {
      if (!isTpExtensionInstall()) {
        return "";
      }
      const data = await window.tokenpocket?.solana.signTransaction(
        VersionedTransaction.deserialize(Buffer.from(transactionHex, "hex")),
      );
      if (!data) return "";
      return Buffer.from(data.serialize()).toString("hex");
    },
    type: "tp",
  } as IWallet;
};

export const useWcWallet = () => {
  const { walletProvider } = useAppKitProvider<Provider>("solana");
  const { status } = useAppKitAccount();

  const { isReady, isPending, connect } = useAppKitWallet({
    onSuccess(data) {},
    onError(error) {},
  });

  const {
    data: currAddress,
    isLoading: pending,
    refetch,
  } = useQuery({
    queryKey: ["wc-wallet"],
    queryFn: async () => {
      if (!walletProvider) return null;
      const data = await walletProvider.getAccounts();
      console.log("data", data);
      return data[0].address;
    },
  });

  const wallet = useMemo<IWallet>(() => {
    return {
      currAddress,
      pending: isPending || pending || status === "connecting",
      isConnected: () => {
        return isReady && walletProvider;
      },
      getAccount: async () => {
        if (currAddress) return currAddress;
        const data = await walletProvider.getAccounts();
        return data[0].address;
      },
      connect: async () => {
        return connect("walletConnect");
      },
      signMessage: async (message: string) => {
        console.log("signMessage", message, walletProvider);
        const signedMessage = await walletProvider.signMessage(
          new TextEncoder().encode(message),
        );
        return Buffer.from(signedMessage).toString("hex");
      },
      signTransaction: async (transactionHex: string) => {
        console.log("signMessage", transactionHex, walletProvider);

        const transaction = VersionedTransaction.deserialize(
          Buffer.from(transactionHex, "hex"),
        );
        const signedTransaction =
          await walletProvider.signTransaction(transaction);
        return Buffer.from(signedTransaction.serialize()).toString("hex");
      },
      type: "wc",
    } as IWallet;
  }, [
    walletProvider,
    currAddress,
    isPending,
    isReady,
    connect,
    pending,
    status,
  ]);

  useEffect(() => {
    if (!walletProvider) return;
    refetch();
  }, [refetch, walletProvider]);

  return wallet;
};

export function useWallet({
  address,
  network,
}: { address?: string; network: "solana" }) {
  const tpWallet = useTpWallet();
  const wcWallet = useWcWallet();
  const [wallet, setWallet] = useState<IWallet | null>(null);

  useEffect(() => {
    if (wcWallet.currAddress === address) {
      setWallet(wcWallet);
      return;
    }

    if (isTpExtensionInstall()) {
      setWallet(tpWallet);
      return;
    }

    if (wcWallet.isConnected() || wcWallet.pending) {
      setWallet(wcWallet);
      return;
    }

    setWallet(tpWallet);
  }, [tpWallet.currAddress, wcWallet.currAddress, wcWallet.pending, address]);

  return {
    wallet,
    connect: async (type: "tp" | "wc") => {
      if (type === "tp") {
        await tpWallet.connect();
        setWallet(tpWallet);
      } else {
        await wcWallet.connect();
        setWallet(wcWallet);
      }
    },
  };
}
