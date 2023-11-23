import type { Config } from '@ponder/core'
import { http } from 'viem'

export const config: Config = {
  networks: [
    {
      name: 'base_goerli',
      chainId: 84531,
      transport: http(
        process.env.PONDER_RPC_URL_84531 || 'https://goerli.base.org'
      ),
    },
  ],
  contracts: [
    {
      name: 'TeamNick',
      network: 'base_goerli',
      address: '0x69e5838065afac50187961d75c561458c7f6fb8d',
      abi: './abis/TeamNick.json',
      startBlock: 12780309,
    },
  ],
}
