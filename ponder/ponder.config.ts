import type { Config } from "@ponder/core";
import { http } from "viem";

export const config: Config = {
  networks: [
    {
      name: "base_goerli",
      chainId: 84531,
      transport: http(
        process.env.PONDER_RPC_URL_84531 || "https://goerli.base.org"
      ),
    },
  ],
  contracts: [
    {
      name: "TeamNick",
      network: "base_goerli",
      address: "0xc8c115dc24aaa7ec8c94c62378e2bf2ab5f20d27",
      abi: "./abis/TeamNick.json",
      startBlock: 12918050,
    },
  ],
};
