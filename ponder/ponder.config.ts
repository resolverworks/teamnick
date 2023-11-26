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
      address: "0x06e93e892934c9d0c970352db66d3a294a15f2ab",
      abi: "./abis/TeamNick.json",
      startBlock: 12905100,
    },
  ],
};
