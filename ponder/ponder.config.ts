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
      address: "0xbf69e114891d1fd029d0fd632144849db98f4dc8",
      abi: "./abis/TeamNick.json",
      startBlock: 12886628,
    },
  ],
};
