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
      address: '0xd966A7be6d7dC7269D302B5e6D884B221E1a72B4',
      abi: './abis/TeamNick.json',
      startBlock: 12501050,
    },
  ],
}
