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
      address: "0x5886a303c6f327d6b7728ae2296d7f13d9ba983d",
      abi: "./abis/TeamNick.json",
      startBlock: 12925880,
    },
  ],
};
