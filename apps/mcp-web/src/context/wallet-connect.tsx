// "use client";
// import { SolanaAdapter } from "@reown/appkit-adapter-solana/react";
// import { solana, solanaDevnet, solanaTestnet } from "@reown/appkit/networks";
// import { createAppKit } from "@reown/appkit/react";
// import {
//   PhantomWalletAdapter,
//   SolflareWalletAdapter,
// } from "@solana/wallet-adapter-wallets";

// const solanaWeb3JsAdapter = new SolanaAdapter({
//   wallets: [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
// });
// const projectId = "e0cf898505f07a766d5103305b1d7dbe";

// const metadata = {
//   name: "TokenPocket Wallet",
//   description: "TokenPocket Wallet",
//   url: "https://www.tokenpocket.pro/", // origin must match your domain & subdomain
//   icons: ["https://www.tokenpocket.pro/_nuxt/img/logo-2.6c59296.png"],
// };

// createAppKit({
//   adapters: [solanaWeb3JsAdapter],
//   networks: [solana, solanaTestnet, solanaDevnet],
//   features: {
//     connectMethodsOrder: ["wallet"],
//     swaps: false,
//   },
//   metadata: metadata,
//   projectId,
//   themeMode: "light",
// });

// export default function WalletConnectProvider({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   console.log(solana.id)
//   return children;
// }
