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
      address: '0x32ed01dea1816712bfbdf579cb8063dfb5c1dcbd',
      abi: './abis/TeamNick.json',
      startBlock: 12674486,
    },
  ],
}
