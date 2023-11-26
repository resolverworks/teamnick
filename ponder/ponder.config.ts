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
      address: "0xe9175bbb042d4579eac537f547bcecd2363f68c2",
      abi: "./abis/TeamNick.json",
      startBlock: 12887197,
    },
  ],
};
