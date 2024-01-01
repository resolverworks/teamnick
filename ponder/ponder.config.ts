import type { Config } from "@ponder/core";
import { http } from "viem";

export const config: Config = {
  networks: [
    {
      name: "base",
      chainId: 8453,
      transport: http(
        process.env.PONDER_RPC_URL_8453 || "https://base.llamarpc.com"
      ),
    },
  ],
  contracts: [
    {
      name: "TeamNick",
      network: "base",
      address: "0x7C6EfCb602BC88794390A0d74c75ad2f1249A17f",
      abi: "./abis/TeamNick.json",
      startBlock: 7128431,
    },
  ],
};
