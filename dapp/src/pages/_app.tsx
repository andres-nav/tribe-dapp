import type { AppProps } from "next/app";
import { useEffect, useState } from "react";

import {
  RainbowKitProvider,
  connectorsForWallets,
} from "@rainbow-me/rainbowkit";
import {
  injectedWallet,
  metaMaskWallet,
  ledgerWallet,
  walletConnectWallet,
  coinbaseWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { mainnet, sepolia, hardhat } from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";

import "../styles/globals.scss";
import "@rainbow-me/rainbowkit/styles.css";

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
const appName = process.env.NEXT_PUBLIC_APP_NAME;

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [
    mainnet,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true"
      ? [sepolia, hardhat]
      : []),
  ],
  [alchemyProvider({ apiKey: process.env.ALCHEMY_API }), publicProvider()]
);

const connectors = connectorsForWallets([
  {
    groupName: "Recommended",
    wallets: [
      injectedWallet({ chains }),
      metaMaskWallet({ projectId, chains }),
      ledgerWallet({ projectId, chains }),
      walletConnectWallet({ projectId, chains }),
    ],
  },
  {
    groupName: "Others",
    wallets: [coinbaseWallet({ chains, appName })],
  },
]);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

function App({ Component, pageProps }: AppProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  return (
    <>
      {ready ? (
        <WagmiConfig config={wagmiConfig}>
          <RainbowKitProvider chains={chains}>
            <Component {...pageProps} />
          </RainbowKitProvider>
        </WagmiConfig>
      ) : null}
    </>
  );
}

export default App;
