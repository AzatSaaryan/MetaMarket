import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, sepolia, goerli, optimism, polygon } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "MetaMarket",
  projectId: "demo",
  chains: [mainnet, sepolia, goerli, optimism, polygon],
  ssr: true,
});
