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
      address: "0xf604051a9db102b4f8fb2e8feb12594d87afe3cc",
      abi: "./abis/TeamNick.json",
      startBlock: 12905100,
    },
  ],
};
