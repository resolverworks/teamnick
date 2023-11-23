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
      address: '0xa63cf205df9d8e84c5611fe0a244211f9c00bf2d',
      abi: './abis/TeamNick.json',
      startBlock: 12718186,
    },
  ],
}
