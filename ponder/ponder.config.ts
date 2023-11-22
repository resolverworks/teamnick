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
      address: '0xed594c91d056340fb24856edb1c2ca90e153a9a2',
      abi: './abis/TeamNick.json',
      startBlock: 12717802,
    },
  ],
}
