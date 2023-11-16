import 'dotenv/config'
import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox-viem'
import '@nomicfoundation/hardhat-verify'
import 'hardhat-storage-layout'

const DEPLOYER_KEY = process.env.DEPLOYER_KEY
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY
const BASESCAN_API_KEY = process.env.BASESCAN_API_KEY

if (!DEPLOYER_KEY) throw new Error('DEPLOYER_KEY must be set')
if (!ETHERSCAN_API_KEY) throw new Error('ETHERSCAN_API_KEY must be set')
if (!BASESCAN_API_KEY) throw new Error('BASESCAN_API_KEY must be set')

const config: HardhatUserConfig = {
  networks: {
    goerli: {
      url: process.env.GOERLI_RPC || 'https://rpc.ankr.com/eth_goerli',
      accounts: [DEPLOYER_KEY],
    },
    base: {
      url: process.env.BASE_RPC || 'https://base.llamarpc.com',
      accounts: [DEPLOYER_KEY],
    },
  },
  solidity: {
    compilers: [
      {
        version: '0.8.21',
        settings: {
          optimizer: {
            enabled: true,
            runs: 100000,
          },
        },
      },
    ],
  },
  etherscan: {
    apiKey: {
      goerli: ETHERSCAN_API_KEY,
    },
  },
  paths: {
    sources: './src',
  },
}

export default config
