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
      address: "0xc6a83d8840e0c01a7b7071b268214e3559b3973c",
      abi: "./abis/TeamNick.json",
      startBlock: 12884652,
    },
  ],
};
