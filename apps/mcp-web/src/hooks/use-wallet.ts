// import { storageKeySchema } from "@/lib/storage";
// import { getToken } from "@/lib/storage";
// import { isTpExtensionInstall } from "@/lib/utils";
// import type { Provider } from "@reown/appkit-adapter-solana";
// import { useAppKitWallet } from "@reown/appkit-wallet-button/react";
// import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
// import { VersionedTransaction } from "@solana/web3.js";
// import { useQuery } from "@tanstack/react-query";
// import { useEffect, useMemo, useState } from "react";

// interface IWallet {
//   currAddress: string | null;
//   pending: boolean;
//   isConnected: () => boolean;
//   getAccount: () => Promise<string>;
//   connect: (network: "solana" | "evm") => Promise<void>;
//   signMessage: (message: string) => Promise<string>;
//   signTransaction: (transactionHex: string) => Promise<string>;
//   disconnect: () => Promise<void>;
//   type: "tp" | "wc";
// }

// type UseWalletType = (param: { network: "solana" | "evm" }) => IWallet;

// const getTpWallet = (network: "solana" | "evm") => {
//   if (network === "solana") {
//     return window.tokenpocket?.solana;
//   }
//   return window.tokenpocket?.solana;
// };
// export const useTpWallet: UseWalletType = ({ network }) => {
//   const {
//     data: currAddress,
//     isLoading: pending,
//     refetch,
//   } = useQuery({
//     queryKey: ["tp-wallet"],
//     queryFn: async () => {
//       if (!isTpExtensionInstall()) return "";
//       if (!getTpWallet(network)?.isConnected) {
//         return;
//       }
//       const address = await getTpWallet(network)?.getAccount();
//       return address;
//     },
//   });

//   const init = async () => {
//     if (getToken()) {
//       await getTpWallet(network)?.connect();
//     }
//     refetch();
//   };

//   useEffect(() => {
//     init();
//   }, [currAddress]);

//   return {
//     currAddress,
//     pending,
//     isConnected: () => {
//       if (!isTpExtensionInstall()) {
//         return false;
//       }
//       return getTpWallet(network)?.isConnected;
//     },
//     getAccount: async () => {
//       if (!isTpExtensionInstall()) {
//         return "";
//       }
//       return getTpWallet(network)?.getAccount();
//     },
//     connect: async () => {
//       console.log(getTpWallet(network));
//       if (!isTpExtensionInstall()) {
//         return;
//       }
//       await getTpWallet(network)?.connect();
//       await refetch();
//     },
//     signMessage: async (message: string) => {
//       if (!isTpExtensionInstall()) {
//         return "";
//       }

//       const data = await getTpWallet(network)?.signMessage(
//         new TextEncoder().encode(message),
//       );
//       if (!data) return "";
//       return Buffer.from(data.signature).toString("hex");
//     },
//     signTransaction: async (transactionHex: string) => {
//       if (!isTpExtensionInstall()) {
//         return "";
//       }
//       const data = await getTpWallet(network)?.signTransaction(
//         VersionedTransaction.deserialize(Buffer.from(transactionHex, "hex")),
//       );
//       if (!data) return "";
//       return Buffer.from(data.serialize()).toString("hex");
//     },
//     disconnect: async () => {
//       if (!isTpExtensionInstall()) {
//         return;
//       }
//       await getTpWallet(network)?.disconnect();
//     },

//     type: "tp",
//   } as IWallet;
// };

// export const useWcWallet: UseWalletType = ({ network }) => {
//   const { walletProvider } = useAppKitProvider<Provider>("solana");
//   const { status } = useAppKitAccount();

//   const { isReady, isPending, connect } = useAppKitWallet({
//     onSuccess(data) {},
//     onError(error) {},
//   });

//   const {
//     data: currAddress,
//     isLoading: pending,
//     refetch,
//   } = useQuery({
//     queryKey: ["wc-wallet"],
//     queryFn: async () => {
//       if (!walletProvider) return null;
//       const data = await walletProvider.getAccounts();
//       console.log("data", data);
//       return data[0].address;
//     },
//   });

//   const wallet = useMemo<IWallet>(() => {
//     return {
//       currAddress,
//       pending: isPending || pending || status === "connecting",
//       isConnected: () => {
//         return isReady && walletProvider;
//       },
//       getAccount: async () => {
//         if (currAddress) return currAddress;
//         const data = await walletProvider.getAccounts();
//         return data[0].address;
//       },
//       connect: async () => {
//         return connect("walletConnect");
//       },
//       signMessage: async (message: string) => {
//         console.log("signMessage", message, walletProvider);
//         const signedMessage = await walletProvider.signMessage(
//           new TextEncoder().encode(message),
//         );
//         return Buffer.from(signedMessage).toString("hex");
//       },
//       signTransaction: async (transactionHex: string) => {
//         console.log("signMessage", transactionHex, walletProvider);

//         const transaction = VersionedTransaction.deserialize(
//           Buffer.from(transactionHex, "hex"),
//         );
//         const signedTransaction =
//           await walletProvider.signTransaction(transaction);
//         return Buffer.from(signedTransaction.serialize()).toString("hex");
//       },
//       disconnect: async () => {
//         await walletProvider.disconnect();
//       },
//       type: "wc",
//     } as IWallet;
//   }, [
//     walletProvider,
//     currAddress,
//     isPending,
//     isReady,
//     connect,
//     pending,
//     status,
//   ]);

//   useEffect(() => {
//     if (!walletProvider) return;
//     refetch();
//   }, [refetch, walletProvider]);

//   return wallet;
// };

// export function useWallet({
//   address,
// }: { address?: string; network?: "solana" }) {
//   const [wallet, setWallet] = useState<IWallet | null>(null);
//   const [network, setNetwork] = useState<"solana" | "evm">("solana");
//   const tpWallet = useTpWallet({ network });
//   const wcWallet = useWcWallet({ network });

//   useEffect(() => {
//     if (wcWallet.currAddress === address) {
//       setWallet(wcWallet);
//       return;
//     }
//     if (wcWallet.isConnected() || wcWallet.pending) {
//       setWallet(wcWallet);
//       return;
//     }
//     setWallet(tpWallet);
//   }, [tpWallet.currAddress, wcWallet.currAddress, wcWallet.pending, address]);

//   return {
//     wallet: {
//       ...(wallet || {}),
//       disconnect: async () => {
//         setWallet(null);
//         return wallet?.disconnect();
//       },
//     },
//     connect: async (
//       type: "tp" | "wc",
//       network: "solana" | "evm" = "solana",
//     ) => {
//       setNetwork(network);
//       if (type === "tp") {
//         await tpWallet.connect(network);
//         setWallet(tpWallet);
//       } else {
//         await wcWallet.connect(network);
//         setWallet(wcWallet);
//       }
//     },
//   };
// }
