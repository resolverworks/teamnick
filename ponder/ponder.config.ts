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
      address: "0x95198367ff77382f260a3a86a4ccace48cd465b6",
      abi: "./abis/TeamNick.json",
      startBlock: 12905016,
    },
  ],
};
