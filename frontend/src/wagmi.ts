import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, sepolia } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "MetaMarket",
  projectId: "demo",
  chains: [mainnet, sepolia],
  ssr: true,
});
